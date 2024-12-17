import { IpluginInputArgs } from './interfaces/interfaces';
import { CLI } from './cliUtils';
import {
  IFileObject,
  Istreams,
} from './interfaces/synced/IFileObject';
import { isVideo } from './metadataUtils';

export interface CropInfo {
  // width
  w: number;
  // height
  h: number;
  // x offset
  x: number;
  // y offset
  y: number;
}

export const getCropInfoFromString = (cropInfoStr: string): CropInfo => {
  const split: string[] = String(cropInfoStr).split(':');
  return {
    w: Number(split[0] ?? 0),
    h: Number(split[1] ?? 0),
    x: Number(split[2] ?? 0),
    y: Number(split[3] ?? 0),
  };
};

// get the crop info string
export const getCropInfoString = (cropInfo: CropInfo): string => (
  `${cropInfo.w}:${cropInfo.h}:${cropInfo.x}:${cropInfo.y}`
);

// eslint-disable-next-line require-await
export const sleep = async (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

// function to get crop info from a video file
// present as 'inputFileObj' on the args object
export const getCropInfo = async (
  args: IpluginInputArgs,
  file: IFileObject,
  startOffsetPct: number = 5,
  endOffsetPct: number = 5,
  numSamples: number = 250,
  relevantPct: number = 5,
): Promise<CropInfo> => {
  // load os info - used for line splits later
  const os = require('os');
  // determine input video duration
  const totalDuration: number = Math.round(Number(file.ffProbeData.format?.duration ?? 0));
  // calculate scan framerate
  // determine duration of scanned time as total - (start offset + end offset)
  // given the scanned duration and aim for about 250 total samples across this time
  const startOffset: number = Math.round((startOffsetPct / 100) * totalDuration);
  const endOffset: number = Math.round(((100 - endOffsetPct) / 100) * totalDuration);
  const scannedTime: number = totalDuration * ((100 - (startOffset + endOffset)) / 100);
  const fps: number = numSamples / scannedTime;
  // log some details
  args.jobLog(
    `will scan [${scannedTime}/${totalDuration}]s. start offset:${startOffset}s, end offset:${endOffset}s, `
    + `framerate:${fps}fps`,
  );
  // build ffmpeg command
  const spawnArgs: string[] = [];
  // always hide banner and stats
  spawnArgs.push('-hide_banner', '-nostats');
  // set start offset
  spawnArgs.push('-ss', `${startOffset}`);
  // set sample length
  spawnArgs.push('-to', `${endOffset}`);
  // set input file
  spawnArgs.push('-i', file._id);
  // set cropdetect settings
  spawnArgs.push('-vf', `fps=fps=${fps},mestimate,cropdetect=mode=mvedges,metadata=mode=print`);
  // no output file
  spawnArgs.push('-f', 'null', '-');
  // execute cli
  const response: { cliExitCode: number, errorLogFull: string[] } = await (
    new CLI({
      cli: args.ffmpegPath,
      spawnArgs,
      spawnOpts: {},
      jobLog: args.jobLog,
      outputFilePath: file._id,
      inputFileObj: file,
      logFullCliOutput: true, // require full logs to ensure access to all cropdetect data
      updateWorker: args.updateWorker,
      args,
    })).runCli();
  // logs
  await sleep(100);
  args.jobLog('<========== cropdata scan complete ==========>');
  await sleep(100);
  args.jobLog(`parsing [${response.errorLogFull.length}] total lines of log data`);
  // build a list of crop settings
  const cropValues: CropInfo[] = response.errorLogFull
    .filter((line) => line.startsWith('[Parsed_cropdetect_'))
    .map((line) => line.split(os.EOL)[0])
    .map((line) => line.split('crop=').pop())
    .map((line) => getCropInfoFromString(String(line)));
  // determine number of samples we're working with
  args.jobLog(`parsing [${cropValues.length}] lines containing cropdetect data`);
  // build a map of frequency for overall w:h:x:y
  const cropValueFrequency = new Map<string, number>();
  // build arrays separately tracking width and height
  const cropWidthFrequency = new Map<number, number>();
  const cropXOffsetFrequency = new Map<number, Map<number, number>>();
  const cropHeightFrequency = new Map<number, number>();
  const cropYOffsetFrequency = new Map<number, Map<number, number>>();
  // iterate to parse
  cropValues.forEach((cropInfo) => {
    const cropInfoString = getCropInfoString(cropInfo);
    cropValueFrequency.set(cropInfoString, (cropValueFrequency.get(cropInfoString) ?? 0) + 1);
    // track width and x-offset frequencies
    cropWidthFrequency.set(cropInfo.w, (cropWidthFrequency.get(cropInfo.w) ?? 0) + 1);
    if (!cropXOffsetFrequency.get(cropInfo.w)) cropXOffsetFrequency.set(cropInfo.w, new Map<number, number>());
    cropXOffsetFrequency.get(cropInfo.w)?.set(
      cropInfo.x, (cropXOffsetFrequency.get(cropInfo.w)?.get(cropInfo.x) ?? 0) + 1,
    );
    // track height and y-offset frequencies
    cropHeightFrequency.set(cropInfo.h, (cropHeightFrequency.get(cropInfo.h) ?? 0) + 1);
    if (!cropYOffsetFrequency.get(cropInfo.h)) cropYOffsetFrequency.set(cropInfo.h, new Map<number, number>());
    cropYOffsetFrequency.get(cropInfo.h)?.set(
      cropInfo.y, (cropYOffsetFrequency.get(cropInfo.h)?.get(cropInfo.y) ?? 0) + 1,
    );
  });
  // frequency logs
  await sleep(100);
  args.jobLog('<============ frequency data ============>');
  await sleep(100);
  args.jobLog(`detected crop info frequencies: ${JSON.stringify(cropValueFrequency)}`);
  await sleep(100);
  args.jobLog('<============ frequency data ============>');
  await sleep(100);
  // determine if we can just return the top value or if we need to parse
  const numValues = cropValueFrequency.size;
  let returnInfo: CropInfo;
  if (numValues > 1) {
    args.jobLog(`detected ${numValues} unique cropdetect values - calculating best result`);
    // pull values from input file - first get the video stream
    const videoStream: Istreams | undefined = file?.ffProbeData?.streams?.filter(isVideo)[0];
    if (!videoStream) {
      throw new Error('Failed to find a video stream - why are you attempting to de-letterbox a non-video file?');
    }
    // ==== determine width and X offset ====
    const inputWidth: number = Number(videoStream.width);
    let outputWidth: number = 0;
    let outputX: number = 0;
    // check for an easy exit - is the native width a meaningful percent of total samples
    if ((cropWidthFrequency.get(inputWidth) ?? 0) > (numValues * (relevantPct / 100))) {
      // video appears to be native width
      outputWidth = inputWidth;
      outputX = 0;
    } else {
      // video appears to be pillarboxed
      // find the maximum value representing at least {relevantPct}% of sampled frames
      cropWidthFrequency.forEach((widthVal: number, widthFrequency: number) => {
        if ((widthVal > outputWidth) && (widthFrequency >= (numValues * (relevantPct / 100)))) {
          outputWidth = widthVal;
        }
      });
      // now grab the most frequent x-offset for the selected width value
      let xOffsetCount: number = 0;
      cropXOffsetFrequency.get(outputWidth)?.forEach((offsetVal: number, offsetFrequency: number) => {
        if (offsetFrequency > xOffsetCount) {
          outputX = offsetVal;
          xOffsetCount = offsetFrequency;
        }
      });
    }
    // ==== determine height and Y offset ====
    const inputHeight: number = Number(videoStream.height);
    let outputHeight: number = 0;
    let outputY: number = 0;
    // check for an easy exit - is the native height a meaningful percent of total samples
    if ((cropHeightFrequency.get(inputHeight) ?? 0) > (numValues * (relevantPct / 100))) {
      outputHeight = inputHeight;
      outputY = 0;
    } else {
      // video appears to be letterboxed
      // find the maximum value representing at least {relevantPct}% of sampled frames
      cropHeightFrequency.forEach((heightVal: number, heightFrequency: number) => {
        if ((heightVal > outputHeight) && (heightFrequency >= (numValues * (relevantPct / 100)))) {
          outputHeight = heightVal;
        }
      });
      // now grab the most frequent y-offset for the selected height value
      let yOffsetCount: number = 0;
      cropYOffsetFrequency.get(outputHeight)?.forEach((offsetVal: number, offsetFrequency: number) => {
        if (offsetFrequency >= yOffsetCount) {
          outputY = offsetVal;
          yOffsetCount = offsetFrequency;
        }
      });
    }
    // build the return CropInfo object from our selected values
    returnInfo = {
      w: outputWidth,
      h: outputHeight,
      x: outputX,
      y: outputY,
    };
  } else {
    // return the only detected value
    returnInfo = cropValues[0];
  }
  args.jobLog(`returning crop info: ${JSON.stringify(returnInfo)}`);
  await sleep(100);
  args.jobLog('<=================== end ===================>');
  return returnInfo;
};

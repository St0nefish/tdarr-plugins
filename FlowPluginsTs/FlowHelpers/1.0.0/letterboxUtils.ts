import {
  IffmpegCommandStream,
  IpluginInputArgs
} from './interfaces/interfaces';
import { CLI } from './cliUtils';
import { Istreams } from './interfaces/synced/IFileObject';
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

export const getCropInfoString = (cropInfo: CropInfo): string => (
  `${cropInfo.w}:${cropInfo.h}:${cropInfo.x}:${cropInfo.y}`
);

export interface CropInfoWidth {
  w: number;
  x: number;
}

export interface CropInfoHeight {
  h: number;
  y: number;
}

// eslint-disable-next-line require-await
export const sleep = async (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const getCropInfo = async (args: IpluginInputArgs): Promise<CropInfo> => {
  // load os info
  const os = require('os');
  // regex to find cropdetect settings
  const cropRegex: RegExp = /(\d+:\d+:\d+:\d+)/gm;
  // determine input video duration
  const totalDuration: number = Math.round(Number(args.inputFileObj.ffProbeData.format?.duration ?? 0));
  args.jobLog(`will scan ${Math.round(totalDuration * 0.90)} seconds of the total ${totalDuration} seconds`);
  // calculate scan framerate
  // determine duration of scanned time as total - (start offset + end offset)
  // given the scanned duration and aim for about 250 total samples across this time
  const startOffset: number = Math.round(0.05 * totalDuration);
  const endOffset: number = Math.round(0.95 * totalDuration);
  const scannedTime: number = totalDuration - (startOffset + endOffset);
  const fps: number = 250 / (totalDuration * 0.90);
  // log some details
  args.jobLog(
    `total duration:${totalDuration}s, scanned duration:${scannedTime}s, `
    + `start offset:${startOffset}s, end offset:${endOffset}, scan framerate:${fps}fps`,
  );
  // build ffmpeg command
  const spawnArgs: string[] = [];
  // always hide banner and stats
  spawnArgs.push('-hide_banner', '-nostats');
  // set start offset
  spawnArgs.push('-ss', `${600}`);
  // set sample length
  spawnArgs.push('-to', `${900}`);
  // set input file
  spawnArgs.push('-i', args.inputFileObj._id);
  // set cropdetect settings
  spawnArgs.push('-vf', `fps=fps=${0.1},mestimate,cropdetect=mode=mvedges,metadata=mode=print`);
  // no output file
  spawnArgs.push('-f', 'null', '-');
  // execute cli
  const response: { cliExitCode: number, errorLogFull: string[] } = await (
    new CLI({
      cli: args.ffmpegPath,
      spawnArgs,
      spawnOpts: {},
      jobLog: args.jobLog,
      outputFilePath: args.inputFileObj._id,
      inputFileObj: args.inputFileObj,
      logFullCliOutput: args.logFullCliOutput,
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
  const numSamples: number = cropValues.length;
  args.jobLog(`parsing ${numSamples} lines containing cropdetect data`);
  // build a map of frequency for overall w:h:x:y
  const cropValueFrequency: { [key: string]: number } = {};
  // build arrays separately tracking width and height
  const cropWidthFrequency: { [key: number]: number } = {};
  const cropXOffsetFrequency: { [key: number]: { [key: number]: number } } = {};
  const cropHeightFrequency: { [key: number]: number } = {};
  const cropYOffsetFrequency: { [key: number]: { [key: number]: number } } = {};
  // iterate to parse
  cropValues.forEach((cropInfo) => {
    const cropInfoString = getCropInfoString(cropInfo);
    cropValueFrequency[cropInfoString] = (cropValueFrequency[cropInfoString] ?? 0) + 1;
    // track width and x-offset frequencies
    cropWidthFrequency[cropInfo.w] = (cropWidthFrequency[cropInfo.w] ?? 0) + 1;
    cropXOffsetFrequency[cropInfo.w] ??= {};
    cropXOffsetFrequency[cropInfo.w][cropInfo.x] = (cropXOffsetFrequency[cropInfo.w][cropInfo.x] ?? 0) + 1;
    // track height and y-offset frequencies
    cropHeightFrequency[cropInfo.h] = (cropHeightFrequency[cropInfo.h] ?? 0) + 1;
    cropYOffsetFrequency[cropInfo.h] ??= {};
    cropYOffsetFrequency[cropInfo.h][cropInfo.y] = (cropYOffsetFrequency[cropInfo.h][cropInfo.y] ?? 0) + 1;
  });
  // frequency logs
  await sleep(100);
  args.jobLog('<========== start frequency data ==========>');
  await sleep(100);
  args.jobLog(`crop info frequencies: ${JSON.stringify(cropValueFrequency)}`);
  args.jobLog(`crop info width frequencies: ${JSON.stringify(cropWidthFrequency)}`);
  args.jobLog(`crop info x-offset frequencies: ${JSON.stringify(cropXOffsetFrequency)}`);
  args.jobLog(`crop info height frequencies: ${JSON.stringify(cropHeightFrequency)}`);
  args.jobLog(`crop info y-offset frequencies: ${JSON.stringify(cropYOffsetFrequency)}`);
  await sleep(100);
  args.jobLog('<=========== end frequency data ===========>');
  await sleep(100);
  // determine if we can just return the top value or if we need to parse
  const numValues = Object.keys(cropValueFrequency).length;
  if (numValues > 1) {
    args.jobLog(`detected ${numValues} unique cropdetect values - calculating best result`);
    // pull values from input file - first get the video stream
    const videoStream: Istreams | undefined = args.inputFileObj?.ffProbeData?.streams?.filter(isVideo)[0];
    if (!videoStream) {
      throw new Error('Failed to find a video stream - why are you attempting to de-letterbox a non-video file?');
    }
    // ==== determine width and X offset ====
    const inputWidth: number = Number(videoStream.width);
    let outputWidth: number = 0;
    let outputX: number = 0;
    // if native width is present and at least 5% of frames keep it
    if (cropWidthFrequency[inputWidth] && cropWidthFrequency[inputWidth] >= (numValues * 0.05)) {
      outputWidth = inputWidth;
      outputX = 0;
    } else {
      // weird, video appears to be pillarboxed - find the maximum value representing at least 5% of sampled frames
      Object.keys(cropWidthFrequency).forEach((widthStr: string) => {
        const widthVal: number = Number(widthStr);
        if ((widthVal > outputWidth) && (cropWidthFrequency[widthVal] >= (numValues * 0.05))) {
          outputWidth = widthVal;
        }
      });
      // now grab the most frequent x-offset for the selected width value
      let xOffsetCount: number = 0;
      Object.keys(cropXOffsetFrequency[outputWidth]).forEach((offsetStr: string) => {
        const offsetVal: number = Number(offsetStr);
        if (cropXOffsetFrequency[outputWidth][offsetVal] > xOffsetCount) {
          outputX = offsetVal;
          xOffsetCount = cropXOffsetFrequency[outputWidth][offsetVal];
        }
      });
    }
    // ==== determine height and Y offset ====
    const inputHeight: number = Number(videoStream.height);
    let outputHeight: number = 0;
    let outputY: number = 0;
    // if native height is present and at least 5% of frames keep it
    if (cropHeightFrequency[inputHeight] && cropHeightFrequency[inputHeight] >= (numValues * 0.05)) {
      outputHeight = inputHeight;
      outputY = 0;
    } else {
      // video appears to be letterboxed - find the maximum value representing at least 5% of sampled frames
      Object.keys(cropHeightFrequency).forEach((heightStr: string) => {
        const heightVal: number = Number(heightStr);
        if ((heightVal > outputHeight) && (cropHeightFrequency[heightVal] >= (numValues * 0.05))) {
          outputHeight = heightVal;
        }
      });
      // now grab the most frequent y-offset for the selected height value
      let yOffsetCount: number = 0;
      Object.keys(cropYOffsetFrequency[outputHeight]).forEach((offsetStr: string) => {
        const offsetVal: number = Number(offsetStr);
        if (cropYOffsetFrequency[outputHeight][offsetVal] >= yOffsetCount) {
          outputY = offsetVal;
          yOffsetCount = cropYOffsetFrequency[outputHeight][offsetVal];
        }
      });
    }
    // build the return CropInfo object from our selected values
    return {
      w: outputWidth,
      h: outputHeight,
      x: outputX,
      y: outputY,
    };
  }
  // return the only detected value
  return cropValues[0];
};

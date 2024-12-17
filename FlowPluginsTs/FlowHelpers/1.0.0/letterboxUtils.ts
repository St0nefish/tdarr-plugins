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
// args: input plugin argument object
// file: file to detect letterboxing for
// enableHwDecoding: use hardware decoding (if available)
// cropMode: handbrake crop-mode - 'auto' or 'conservative'
// startOffsetPct: percent of the file to skip at the beginning (avoid scanning intros)
// endOffsetPct: percent of the file to skip at the end (avoid scanning outro)
// samplesPerMinute: number of image samples to take per minute of scanned video
// minCropPct: minimum percent of dimension to be removed to be worth cropping
export const getCropInfo = async (
  args: IpluginInputArgs,
  file: IFileObject,
  enableHwDecoding: boolean = true,
  cropMode: string = 'conservative',
  startOffsetPct: number = 5,
  endOffsetPct: number = 5,
  samplesPerMinute: number = 2,
  minCropPct: number = 2,
): Promise<CropInfo> => {
  // load os info - used for line splits later
  const os = require('os');
  // for executing commands
  const childProcess = require('child_process');
  const exec = require('util').promisify(childProcess.exec);
  const execSync = childProcess.execSync;
  const spawnSync = childProcess.spawnSync;

  // ToDo - remove
  args.jobLog(`hardware type: ${args.nodeHardwareType}`);
  args.jobLog(`worker type: ${args.workerType}`);
  // ToDo - remove

  // find the video stream
  const videoStream: Istreams | undefined = file?.ffProbeData?.streams?.filter(isVideo)[0];
  if (!videoStream) {
    throw new Error('Failed to find a video stream - why are you attempting to de-letterbox a non-video file?');
  }
  // grab total duration and determine start time, end time, and total scanned duration
  const totalDuration: number = Math.round(Number(file.ffProbeData.format?.duration ?? 0));
  const startTime: number = Math.round((startOffsetPct / 100) * totalDuration);
  const endTime: number = Math.round(((100 - endOffsetPct) / 100) * totalDuration);
  const scannedTime: number = endTime - startTime;
  // calculate number of previews
  const numPreviews = Math.round((scannedTime / 60) * samplesPerMinute);
  // log execution details
  args.jobLog(`will scan [${scannedTime}/${totalDuration}]s (start:[${startTime}s], end:[${endTime}s]), `
    + `mode:[${cropMode}], previews:[${numPreviews}]`);
  // build command
  const command: string[] = [];
  // input file
  command.push('-i', `'${file._id}'`);
  // only scan main feature
  command.push('--main-feature');
  // crop mode
  command.push('--crop-mode', cropMode);
  // number of previews (persist to disk)
  command.push('--previews', `${numPreviews}:1`);
  // set start time
  command.push('--start-at', `seconds:${startTime}`);
  // set end time
  command.push('--stop-at', `seconds:${endTime}`);
  // handle hardware decoding
  if (enableHwDecoding) {
    // ToDo - determine decoder
    command.push('--enable-hw-decoding', 'nvdec');
  }
  // scan only
  command.push('--scan');
  // log command
  args.jobLog(`scan command: ${args.handbrakePath} ${command.join(' ')}`);
  // execute scan command
  const output: string[] = [];
  const cliExitCode: number = await new Promise((resolve) => {
    try {
      const spawnArgs = command.map((row: string) => row.trim()).filter((row: string) => row !== '');
      const thread = childProcess.spawn(args.handbrakePath, spawnArgs, {});

      thread.stdout.on('data', (data: string) => {
        output.push(data.toString());
      });

      thread.stderr.on('data', (data: string) => {
        // eslint-disable-next-line no-console
        output.push(data.toString());
      });

      thread.on('error', () => {
        // catches execution error (bad file)
        args.jobLog(`Error executing binary: ${args.handbrakePath}`);
        resolve(1);
      });

      thread.on('close', (code: number) => {
        if (code !== 0) {
          args.jobLog(`CLI error code: ${code}`);
        }
        resolve(code);
      });
    } catch (err) {
      // catches execution error (no file)
      args.jobLog(`Error executing binary: ${args.handbrakePath}: ${err}`);
      resolve(1);
    }
  });

  args.jobLog(`handbrake completed with code [${cliExitCode}] and output: ${output.join('')}`);

  // // logs
  // await sleep(100);
  // args.jobLog('<========== cropdetect scan complete ==========>');
  // await sleep(100);
  // args.jobLog(`parsing [${response.errorLogFull.length}] total lines of log data`);
  // // build a list of crop settings
  // const cropValues: CropInfo[] = response.errorLogFull
  //   .filter((line) => line.startsWith('[Parsed_cropdetect_'))
  //   .map((line) => line.split(os.EOL)[0])
  //   .map((line) => line.split('crop=').pop())
  //   .map((line) => getCropInfoFromString(String(line)));
  // // determine number of samples we're working with
  // args.jobLog(`parsing [${cropValues.length}] lines containing cropdetect data`);
  // // build a map of frequency for overall w:h:x:y
  // const cropValueFrequency = new Map<string, number>();
  // // build arrays separately tracking width and height
  // const cropWidthFrequency = new Map<number, number>();
  // const cropXOffsetFrequency = new Map<number, Map<number, number>>();
  // const cropHeightFrequency = new Map<number, number>();
  // const cropYOffsetFrequency = new Map<number, Map<number, number>>();
  // // iterate to parse
  // cropValues.forEach((cropInfo) => {
  //   const cropInfoString = getCropInfoString(cropInfo);
  //   cropValueFrequency.set(cropInfoString, (cropValueFrequency.get(cropInfoString) ?? 0) + 1);
  //   // track width and x-offset frequencies
  //   cropWidthFrequency.set(cropInfo.w, (cropWidthFrequency.get(cropInfo.w) ?? 0) + 1);
  //   if (!cropXOffsetFrequency.get(cropInfo.w)) cropXOffsetFrequency.set(cropInfo.w, new Map<number, number>());
  //   cropXOffsetFrequency.get(cropInfo.w)?.set(
  //     cropInfo.x, (cropXOffsetFrequency.get(cropInfo.w)?.get(cropInfo.x) ?? 0) + 1,
  //   );
  //   // track height and y-offset frequencies
  //   cropHeightFrequency.set(cropInfo.h, (cropHeightFrequency.get(cropInfo.h) ?? 0) + 1);
  //   if (!cropYOffsetFrequency.get(cropInfo.h)) cropYOffsetFrequency.set(cropInfo.h, new Map<number, number>());
  //   cropYOffsetFrequency.get(cropInfo.h)?.set(
  //     cropInfo.y, (cropYOffsetFrequency.get(cropInfo.h)?.get(cropInfo.y) ?? 0) + 1,
  //   );
  // });
  // // frequency logs
  // await sleep(100);
  // args.jobLog('<============ frequency data ============>');
  // await sleep(100);
  // args.jobLog(`detected crop info frequencies: ${JSON.stringify(cropValueFrequency)}`);
  // await sleep(100);
  // args.jobLog('<============ frequency data ============>');
  // await sleep(100);
  // // determine if we can just return the top value or if we need to parse
  // const numValues = cropValueFrequency.size;
  // let returnInfo: CropInfo;
  // if (numValues > 1) {
  //   args.jobLog(`detected ${numValues} unique cropdetect values - calculating best result`);
  //   // ==== determine width and X offset ====
  //   const inputWidth: number = Number(videoStream.width);
  //   let outputWidth: number = 0;
  //   let outputX: number = 0;
  //   // check for an easy exit - is the native width a meaningful percent of total samples
  //   if ((cropWidthFrequency.get(inputWidth) ?? 0) > (numValues * (relevantPct / 100))) {
  //     // video appears to be native width
  //     outputWidth = inputWidth;
  //     outputX = 0;
  //   } else {
  //     // video appears to be pillarboxed
  //     // find the maximum value representing at least {relevantPct}% of sampled frames
  //     cropWidthFrequency.forEach((widthVal: number, widthFrequency: number) => {
  //       if ((widthVal > outputWidth) && (widthFrequency >= (numValues * (relevantPct / 100)))) {
  //         outputWidth = widthVal;
  //       }
  //     });
  //     // now grab the most frequent x-offset for the selected width value
  //     let xOffsetCount: number = 0;
  //     cropXOffsetFrequency.get(outputWidth)?.forEach((offsetVal: number, offsetFrequency: number) => {
  //       if (offsetFrequency > xOffsetCount) {
  //         outputX = offsetVal;
  //         xOffsetCount = offsetFrequency;
  //       }
  //     });
  //   }
  //   // ==== determine height and Y offset ====
  //   const inputHeight: number = Number(videoStream.height);
  //   let outputHeight: number = 0;
  //   let outputY: number = 0;
  //   // check for an easy exit - is the native height a meaningful percent of total samples
  //   if ((cropHeightFrequency.get(inputHeight) ?? 0) > (numValues * (relevantPct / 100))) {
  //     outputHeight = inputHeight;
  //     outputY = 0;
  //   } else {
  //     // video appears to be letterboxed
  //     // find the maximum value representing at least {relevantPct}% of sampled frames
  //     cropHeightFrequency.forEach((heightVal: number, heightFrequency: number) => {
  //       if ((heightVal > outputHeight) && (heightFrequency >= (numValues * (relevantPct / 100)))) {
  //         outputHeight = heightVal;
  //       }
  //     });
  //     // now grab the most frequent y-offset for the selected height value
  //     let yOffsetCount: number = 0;
  //     cropYOffsetFrequency.get(outputHeight)?.forEach((offsetVal: number, offsetFrequency: number) => {
  //       if (offsetFrequency >= yOffsetCount) {
  //         outputY = offsetVal;
  //         yOffsetCount = offsetFrequency;
  //       }
  //     });
  //   }
  //   // build the return CropInfo object from our selected values
  //   returnInfo = {
  //     w: outputWidth,
  //     h: outputHeight,
  //     x: outputX,
  //     y: outputY,
  //   };
  // } else {
  //   // return the only detected value
  //   returnInfo = cropValues[0];
  // }
  // args.jobLog(`returning crop info: ${JSON.stringify(returnInfo)}`);
  // await sleep(100);
  // args.jobLog('<=================== end ===================>');
  // return returnInfo;
  return {
    w: 0,
    h: 0,
    x: 0,
    y: 0,
  };
};

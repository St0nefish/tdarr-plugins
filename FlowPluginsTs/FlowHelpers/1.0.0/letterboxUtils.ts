import { IpluginInputArgs } from './interfaces/interfaces';
import { CLI } from './cliUtils';
import {
  IFileObject,
  Istreams,
} from './interfaces/synced/IFileObject';
import { isVideo } from './metadataUtils';

export interface CropInfo {
  top: number,
  bottom: number,
  left: number,
  right: number,
}

export const getCropInfoFromString = (cropInfoStr: string): CropInfo => {
  const split: string[] = String(cropInfoStr).split('/');
  return {
    top: Number(split[0] ?? 0),
    bottom: Number(split[1] ?? 0),
    left: Number(split[2] ?? 0),
    right: Number(split[3] ?? 0),
  };
};

// get the crop info string
// export const getCropInfoString = (cropInfo: CropInfo): string => (
//   `${cropInfo.w}:${cropInfo.h}:${cropInfo.x}:${cropInfo.y}`
// );

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
  const spawnArgs: string[] = [];
  // input file
  spawnArgs.push('-i', `${file._id}`);
  // only scan main feature
  spawnArgs.push('--main-feature');
  // crop mode
  spawnArgs.push('--crop-mode', cropMode);
  // number of previews (persist to disk)
  spawnArgs.push('--previews', `${numPreviews}:1`);
  // set start time
  spawnArgs.push('--start-at', `seconds:${startTime}`);
  // set end time
  spawnArgs.push('--stop-at', `seconds:${endTime}`);
  // handle hardware decoding
  if (enableHwDecoding) {
    // ToDo - determine decoder
    spawnArgs.push('--enable-hw-decoding', 'nvdec');
  }
  // scan only
  spawnArgs.push('--scan');
  // log command
  args.jobLog(`scan command: ${args.handbrakePath} ${spawnArgs.join(' ')}`);
  // execute scan command
  // execute cli
  const response: { cliExitCode: number, errorLogFull: string[] } = await (
    new CLI({
      cli: args.handbrakePath,
      spawnArgs,
      spawnOpts: {},
      jobLog: args.jobLog,
      outputFilePath: file._id,
      inputFileObj: file,
      logFullCliOutput: true, // require full logs to ensure access to all cropdetect data
      updateWorker: args.updateWorker,
      args,
    })).runCli();
  // find line containing the key data
  const resultLine: string = response.errorLogFull.filter((line: string) => line.includes('autocrop = '))[0];
  args.jobLog(`scan result details: ${resultLine}`);
  // parse autocrop string from line
  const autocropRegex = /(\d+\/\d+\/\d+\/\d+)/;
  const match: RegExpExecArray | null = autocropRegex.exec(resultLine);
  let autocrop: string = '';
  if (match) {
    autocrop = match[1];
  }
  args.jobLog(`autocrop: ${autocrop}`);
  // convert string to object and return
  return getCropInfoFromString(autocrop);
};

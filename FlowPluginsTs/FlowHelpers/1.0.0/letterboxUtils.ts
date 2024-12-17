import { IpluginInputArgs } from './interfaces/interfaces';
import { CLI } from './cliUtils';
import {
  IFileObject,
  Istreams,
} from './interfaces/synced/IFileObject';
import { isVideo } from './metadataUtils';

// class to hold crop info data
export class CropInfo {
  // number of pixels to crop off the top of the video
  top: number;

  // number of pixels to crop off the bottom of the video
  bottom: number;

  // number of pixels to crop off the left of the video
  left: number;

  // number of pixels to crop off the right of the video
  right: number;

  // constructor to create a CropInfo object from raw inputs
  constructor(top: number, bottom: number, left: number, right: number) {
    this.top = top;
    this.bottom = bottom;
    this.left = left;
    this.right = right;
  }

  // determine if this object determines that the video should be cropped
  shouldCrop = (): boolean => this.top > 0 || this.bottom > 0 || this.right > 0 || this.left > 0;

  // get total vertical crop
  verticalCrop = (): number => this.top + this.bottom;

  // get total  horizontal crop
  horizontalCrop = (): number => this.left + this.right;

  // get the string used as an input to ffmpeg crop
  ffmpegCropString = (file: IFileObject): string => {
    // first grab the video stream from the file
    const videoStream: Istreams | undefined = file?.ffProbeData?.streams?.filter(isVideo)?.[0];
    if (!videoStream) {
      throw new Error(`Could not find stream in: ${file._id}`);
    }
    // get input resolution
    const inputWidth: number = videoStream.width ?? 0;
    const inputHeight: number = videoStream.height ?? 0;
    // calculate new width
    const newWidth: number = inputWidth - this.horizontalCrop();
    const newHeight: number = inputHeight - this.verticalCrop();
    // build string
    return `w=${newWidth}:h=${newHeight}:x=${this.left}:y=${this.top}`;
  };
}

// create a crop info object from the string output by Handbrake
export const getCropInfoFromString = (cropInfoStr: string): CropInfo => {
  const split: string[] = String(cropInfoStr).split('/');
  return new CropInfo(Number(split[0] ?? 0), Number(split[1] ?? 0), Number(split[2] ?? 0), Number(split[3] ?? 0));
};

// function to get hardware decoder from configured hardware type
const getHwDecoder = (hardwareType: string): string | null => {
  switch (hardwareType) {
    case 'nvenc':
      return 'nvdec';
    case 'qsv':
      return 'qsv';
    default:
      return null;
  }
};

// scan config object
export interface ScanConfig {
  cropMode?: string,
  startOffsetPct?: number,
  endOffsetPct?: number,
  samplesPerMinute?: number,
  minCropPct?: number,
  enableHwDecoding?: boolean,
  hwDecoder?: string,
}

// function to get crop info from a video file
// args: input plugin argument object
// file: file to detect letterboxing for
// scanConfig: ScanConfig object
export const getCropInfo = async (
  args: IpluginInputArgs,
  file: IFileObject,
  scanConfig: ScanConfig,
): Promise<CropInfo> => {
  // import os for line feeds
  const os = require('os');

  // ToDo - remove
  args.jobLog(`hardware type: ${args.nodeHardwareType}`);
  args.jobLog(`worker type: ${args.workerType}`);
  // ToDo - remove

  // find the video stream
  const videoStream: Istreams | undefined = file?.ffProbeData?.streams?.filter(isVideo)[0];
  if (!videoStream) {
    throw new Error('Failed to find a video stream - why are you attempting to de-letterbox a non-video file?');
  }
  // basic config flags
  const cropMode: string = scanConfig.cropMode ?? 'conservative';
  const enableHwDecoding: boolean = scanConfig.enableHwDecoding ?? false;
  const minCropPct: number = scanConfig.minCropPct ?? 0;
  // calculate duration values
  const totalDuration: number = Math.round(Number(file.ffProbeData.format?.duration ?? 0));
  const startTime: number = Math.round(((scanConfig.startOffsetPct ?? 5) / 100) * totalDuration);
  const endTime: number = Math.round(((100 - (scanConfig.endOffsetPct ?? 5)) / 100) * totalDuration);
  const scannedTime: number = endTime - startTime;
  // calculate number of previews
  const numPreviews = Math.round((scannedTime / 60) * (scanConfig.samplesPerMinute ?? 2));
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
  const hwDecoder = scanConfig.hwDecoder ?? getHwDecoder(args.nodeHardwareType);
  if (enableHwDecoding && hwDecoder) {
    spawnArgs.push('--enable-hw-decoding', hwDecoder);
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
  const resultLine: string = response.errorLogFull
    .filter((line: string) => line.includes('autocrop = '))
    .map((line) => line.substring(line.indexOf('scan: '), line.lastIndexOf(os.EOL) || line.length))[0];
  if (!resultLine) {
    throw new Error('failed to get autocrop results from Handbrake scan');
  }
  // parse out the key parts of the line
  // resultLine = resultLine.substring(resultLine.indexOf('scan: '), resultLine.lastIndexOf(os.EOL) || resultLine.length);
  // parse autocrop string from line
  const autocropRegex = /(?<=autocrop = )(\d+\/\d+\/\d+\/\d+)/;
  const match: RegExpExecArray | null = autocropRegex.exec(resultLine);
  let autocrop: string = '';
  if (match) {
    autocrop = match[0];
  }
  args.jobLog(`${resultLine}`);
  args.jobLog(`autocrop: [${autocrop}]`);
  // convert string to object and return
  const cropInfo: CropInfo = getCropInfoFromString(autocrop);
  // ==== determine if we should zero some fields for being within ignore limits ==== //
  // first check width
  if (cropInfo.horizontalCrop() < (Number(videoStream.width) * (minCropPct / 100))) {
    // total horizontal crop is less than ignore percentile - zero them out
    cropInfo.left = 0;
    cropInfo.right = 0;
  }
  // then check height
  if (cropInfo.verticalCrop() < (Number(videoStream.height) * (minCropPct / 100))) {
    // total vertical crop is less tan ignore percentile - zero them out
    cropInfo.top = 0;
    cropInfo.bottom = 0;
  }
  return cropInfo;
};

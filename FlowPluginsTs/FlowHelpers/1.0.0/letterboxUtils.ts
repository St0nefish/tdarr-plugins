import { IpluginInputArgs } from './interfaces/interfaces';
import { CLI } from './cliUtils';
import {
  IFileObject,
  Istreams,
} from './interfaces/synced/IFileObject';
import { isVideo } from './metadataUtils';

// function to get hardware decoder from configured hardware type
const getHwDecoder = (hardwareType: string): string | null => {
  if (hardwareType === 'nvenc') {
    return 'nvdec';
  }
  return hardwareType;
};

// config object for executing a HandBrake autocrop scan
// cropMode: handbrake --crop-mode type - 'auto' or 'conservative'
// secondsPerPreview: how many seconds (on average) between generated previews
// startOffsetPct: percent of the start of the video to skip to avoid scanning intros
// endOffsetPct: percent of the end of the video to skip to avoid scanning outros/credits
// enableHwDecoding: should hardware decoding be enabled
// hwDecoder: specify hardware decoder - 'auto', 'nvdec', 'qsv', 'vaapi'
export interface HandBrakeCropScanConfig {
  cropMode?: string,
  minCropPct?: number,
  secondsPerPreview?: number,
  startOffsetPct?: number,
  endOffsetPct?: number,
  enableHwDecoding?: boolean,
  hwDecoder?: string,
}

// class to hold crop info data
export class CropInfo {
  // input video width
  inputWidth: number;

  // input video height
  inputHeight: number;

  // output video width
  outputWidth: number;

  // output video height
  outputHeight: number;

  // output X offset
  outputX: number;

  // output Y offset
  outputY: number;

  // constructor to create a CropInfo object from raw inputs
  constructor(
    inputWidth: number,
    inputHeight: number,
    outputWidth: number,
    outputHeight: number,
    outputX: number,
    outputY: number,
  ) {
    this.inputWidth = inputWidth;
    this.inputHeight = inputHeight;
    this.outputWidth = outputWidth;
    this.outputHeight = outputHeight;
    this.outputX = outputX;
    this.outputY = outputY;
  }

  // get total vertical crop
  public getVerticalCrop(): number {
    return this.inputHeight - this.outputHeight;
  }

  // get total  horizontal crop
  public getHorizontalCrop(): number {
    return this.inputWidth - this.outputWidth;
  }

  // set minimum dimensional crop percentage - will zero out a dimensional crop if less than that minimum
  public updateForMinimumCropPercentage(minCropPct: number): void {
    const minCropMulti = minCropPct / 100;
    if (this.getHorizontalCrop() < (this.inputWidth * minCropMulti)) {
      // total horizontal crop is less than minimum - zero it out
      this.outputWidth = this.inputWidth;
      this.outputX = 0;
    }
    if (this.getVerticalCrop() < (this.inputHeight * minCropMulti)) {
      // total vertical crop is less than minimum - zero it out
      this.outputHeight = this.inputHeight;
      this.outputY = 0;
    }
  }

  // get the string used as an input to ffmpeg crop
  public getFfmpegCropString(): string {
    return `w=${this.outputWidth}:h=${this.outputHeight}:x=${this.outputX}:y=${this.outputY}`;
  }

  // get the string used as an input to handbrake crop
  public getHandBrakeCropString(): string {
    // calculate top/bottom/left/right
    const cBottom = this.inputHeight - this.outputHeight - this.outputY;
    const cRight = this.inputWidth - this.outputWidth - this.outputX;
    return `${this.outputY}/${cBottom}/${this.outputX}/${cRight}`;
  }

  // determine if a crop should be executed given the input minimum percentage
  public shouldCrop(minCropPct?: number): boolean {
    // convert percentage to decimal
    const minCropMultiplier = (minCropPct ?? 0) / 100;
    // first check height - it's more likely to require cropping
    if (this.getVerticalCrop() >= (this.inputHeight * minCropMultiplier)) {
      // total vertical crop meets minimum - return true
      return true;
    }
    // then check width - less likely to require cropping
    if (this.getHorizontalCrop() >= (this.inputWidth * minCropMultiplier)) {
      // total horizontal crop meets minimum - return true
      return true;
    }
    // neither dimension met minimums - return false
    return false;
  }

  // determine if this CropInfo is relevant to the input file
  public isRelevant(file: IFileObject): boolean {
    const videoStream: Istreams | undefined = file?.ffProbeData?.streams?.filter(isVideo)[0];
    if (!videoStream) {
      // if the input file doesn't even have a video stream assume it's not relevant
      return false;
    }
    // check if file dimensions match this object's input dimensions
    return this.inputWidth === videoStream.width && this.inputHeight === videoStream.height;
  }

  // create a crop info object from the string output by Handbrake
  public static fromHandBrakeAutocropString(videoStream: Istreams, cropInfoStr: string): CropInfo {
    if (!videoStream.width || !videoStream.height) {
      throw new Error('input stream has no dimensions - unable to calculate crop info');
    }
    const inputWidth = videoStream.width;
    const inputHeight = videoStream.height;
    // split autocrop string to numeric values
    const split: string[] = String(cropInfoStr).split('/');
    const cTop: number = Number(split[0] ?? 0);
    const cBottom: number = Number(split[1] ?? 0);
    const cLeft: number = Number(split[2] ?? 0);
    const cRight: number = Number(split[3] ?? 0);
    // calculate new values
    const newWidth = (videoStream.width ?? 0) - (cLeft + cRight);
    const newHeight = inputHeight - (cTop + cBottom);
    // create and return object
    return new CropInfo(inputWidth, inputHeight, newWidth, newHeight, cLeft, cTop);
  }

  // create a crop info object from a JSON string
  public static fromJsonString(json: string): CropInfo | null {
    // parse json
    const parsedCropInfo: CropInfo = JSON.parse(json, (key, value) => {
      // cast any keys expected to contain numeric values to numbers
      if (['inputWidth', 'inputHeight', 'outputWidth', 'outputHeight', 'outputX', 'outputY'].includes(key)
        && typeof value === 'string') {
        return Number(value.trim() ?? 0);
      }
      return value;
    });
    // if any value is missing then this wasn't a proper CropInfo object so return null
    if (parsedCropInfo.inputWidth === undefined
      || parsedCropInfo.inputHeight === undefined
      || parsedCropInfo.outputWidth === undefined
      || parsedCropInfo.outputHeight === undefined
      || parsedCropInfo.outputX === undefined
      || parsedCropInfo.outputY === undefined
    ) {
      return null;
    }
    // otherwise this is valid, return it
    return parsedCropInfo;
  }

  // function to get crop info from a video file via HandBrake scan
  // args: input plugin argument object
  // file: file to detect letterboxing for
  // scanConfig: ScanConfig object
  public static async fromHandBrakeScan(
    args: IpluginInputArgs,
    file: IFileObject,
    scanConfig: HandBrakeCropScanConfig,
  ): Promise<CropInfo> {
    // ==== load scan configuration ==== //
    // find the video stream
    const videoStream: Istreams | undefined = file?.ffProbeData?.streams?.filter(isVideo)[0];
    if (!videoStream) {
      throw new Error('File does not have a video stream');
    }
    // basic config flags
    const cropMode: string = scanConfig.cropMode ?? 'conservative';
    const enableHwDecoding: boolean = scanConfig.enableHwDecoding ?? false;
    const hwDecoder = (!scanConfig.hwDecoder || scanConfig.hwDecoder === 'auto')
      ? getHwDecoder(args.nodeHardwareType) : scanConfig.hwDecoder;
    // calculate duration values
    const totalDuration: number = Math.round(Number(file.ffProbeData.format?.duration ?? 0));
    const startTime: number = Math.round(((scanConfig.startOffsetPct ?? 0) / 100) * totalDuration);
    const endTime: number = Math.round(((100 - (scanConfig.endOffsetPct ?? 0)) / 100) * totalDuration);
    const scannedTime: number = endTime - startTime;
    // calculate number of previews
    const numPreviews = Math.round(scannedTime / (scanConfig.secondsPerPreview ?? 30));
    // log execution details
    args.jobLog(`will scan [${scannedTime}/${totalDuration}]s (start:[${startTime}s], end:[${endTime}s]), `
      + `mode:[${cropMode}], previews:[${numPreviews}]`);
    // ==== build handbrake command ==== //
    const spawnArgs: string[] = [];
    // input file
    spawnArgs.push('-i', `${file._id}`);
    // set crop mode
    spawnArgs.push('--crop-mode', cropMode);
    // number of previews (persist to disk)
    spawnArgs.push('--previews', `${numPreviews}:1`);
    // set start time
    spawnArgs.push('--start-at', `seconds:${startTime}`);
    // set end time
    spawnArgs.push('--stop-at', `seconds:${endTime}`);
    // handle hardware decoding
    if (enableHwDecoding && hwDecoder) {
      spawnArgs.push('--enable-hw-decoding', hwDecoder);
    }
    // scan only
    spawnArgs.push('--scan');
    // ==== execute scan command ==== //
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
    // ==== parse scan results ==== //
    // find line containing the key data
    const resultLine: string = response.errorLogFull
      .filter((line: string) => line.includes('autocrop = '))
      .map((line) => line.substring(line.indexOf('scan: '), line.lastIndexOf(require('os').EOL) || line.length))[0];
    if (!resultLine) {
      throw new Error('failed to get autocrop results from Handbrake scan');
    }
    args.jobLog(`scan result: ${resultLine}`);
    // parse autocrop string from line
    const autocropRegex = /(?<=autocrop = )(\d+\/\d+\/\d+\/\d+)/;
    const match: RegExpExecArray | null = autocropRegex.exec(resultLine);
    let autocropStr: string = '';
    if (match) {
      autocropStr = match[0];
    }
    args.jobLog(`autocrop: ${autocropStr}`);
    // parse string to CropInfo object and return object
    const cropInfo = CropInfo.fromHandBrakeAutocropString(videoStream, autocropStr);
    // if configured handle minimum percentage
    if (scanConfig.minCropPct) {
      cropInfo.updateForMinimumCropPercentage(scanConfig.minCropPct);
    }
    // return final state
    return cropInfo;
  }
}

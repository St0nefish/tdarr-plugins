import { IpluginInputArgs } from './interfaces/interfaces';
import { CLI } from './cliUtils';

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

export const getCropInfo = async (args: IpluginInputArgs): Promise<CropInfo> => {
  // regex to find cropdetect settings
  const cropRegex: RegExp = /.*(?<=crop=)(\d+:\d+:\d+:\d+)\n(?:.*\n?)+/gm;
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
  args.jobLog('<========== scan complete ==========>');
  args.jobLog(`parsing [${response.errorLogFull.length}] total lines of log data`);
  const cropdetectLines = response.errorLogFull.filter((line) => line.startsWith('[Parsed_cropdetect_'));
  args.jobLog(`parsing [${cropdetectLines.length}] lines containing cropdetect summary`);
  args.jobLog(`cropdetect 0: ${cropdetectLines[0]}`);
  // build a list of crop settings
  const unmatchedLines: string[] = [];
  const cropValues: CropInfo[] = cropdetectLines
    .map((line) => {
      const match: RegExpMatchArray | null = cropRegex.exec(line);
      if (match) {
        return match[1];
      }
      unmatchedLines.push(line);
      return undefined;
    }).filter((line) => line)
    .map((line) => getCropInfoFromString(String(line)));
  args.jobLog(`found ${unmatchedLines.length} unmatched lines`);
  args.jobLog(`unmatched 0: ${unmatchedLines[0]}`);
  // determine number of samples we're working with
  const numSamples: number = cropValues.length;
  args.jobLog(`parsing cropdetect data from ${numSamples} sampled frames`);
  // build a map of frequency for overall w:h:x:y
  const cropValueFrequency: { [key: string]: number } = {};
  // build arrays separately tracking width and height
  const cropWidthFrequency: { [key: number]: number } = {};
  const cropXOffsetFrequency: { [key: number]: { [key: number]: number } } = {};
  const cropHeightFrequency: { [key: number]: number } = {};
  const cropYOffsetFrequency: { [key: number]: { [key: number]: number } } = {};
  // iterate to parse
  cropValues.forEach((cropInfo) => {
    if (cropInfo) {
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
    }
  });
  // frequency logs
  args.jobLog('<========== start frequency data ==========>');
  args.jobLog(`parsed info from ${cropValues.length} total frames`);
  args.jobLog(`crop info frequencies: ${JSON.stringify(cropValueFrequency)}`);
  args.jobLog(`crop info width frequencies: ${JSON.stringify(cropWidthFrequency)}`);
  args.jobLog(`crop info x-offset frequencies: ${JSON.stringify(cropXOffsetFrequency)}`);
  args.jobLog(`crop info height frequencies: ${JSON.stringify(cropHeightFrequency)}`);
  args.jobLog(`crop info y-offset frequencies: ${JSON.stringify(cropYOffsetFrequency)}`);
  args.jobLog('<========== end frequency data ==========>');
  // determine if we can just return the top value or if we need to parse
  const numValues = Object.keys(cropValueFrequency).length;
  if (numValues > 1) {
    args.jobLog(`detected ${numValues} unique cropdetect values - calculating best result`);
  }
  return cropValues[0];
};

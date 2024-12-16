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

export const getCropInfo = async (args: IpluginInputArgs): Promise<CropInfo[]> => {
  // regex to find cropdetect settings
  const cropRegex: RegExp = /.*(?<=crop=)(\d+:\d+:\d+:\d+).*/g;
  // build ffmpeg command
  const spawnArgs: string[] = [];
  // always hide banner and stats
  spawnArgs.push('-hide_banner', '-nostats');
  // set start offset
  spawnArgs.push('-ss', '0:10:00');
  // set sample length
  spawnArgs.push('-to', '0:20:00');
  // set input file
  spawnArgs.push('-i', args.inputFileObj._id);
  // set cropdetect settings
  spawnArgs.push('-vf', 'fps=fps=0.1,mestimate,cropdetect=mode=mvedges,metadata=mode=print');
  // no output file
  spawnArgs.push('-f', 'null', '-');
  // build cli
  const cli = new CLI({
    cli: args.ffmpegPath,
    spawnArgs,
    spawnOpts: {},
    jobLog: args.jobLog,
    outputFilePath: args.inputFileObj._id,
    inputFileObj: args.inputFileObj,
    logFullCliOutput: args.logFullCliOutput,
    updateWorker: args.updateWorker,
    args,
  });
  // execute cli
  const res: { cliExitCode: number, errorLogFull: string[] } = await cli.runCli();
  args.jobLog('<========== scan complete ==========>');
  // build a list of crop settings
  const cropValues: CropInfo[] = res.errorLogFull.filter((line) => line.startsWith('[Parsed_cropdetect_'))
    .map((line) => cropRegex.exec(line)?.[1])
    .filter((line) => line)
    .map((value) => {
      const split: string[] = String(value).split(':');
      return {
        w: Number(split[0] ?? 0),
        h: Number(split[1] ?? 0),
        x: Number(split[2] ?? 0),
        y: Number(split[3] ?? 0),
      };
    });
  // logs
  args.jobLog('<========== raw crop data ==========>');
  cropValues.forEach((cropInfo: CropInfo, index: number) => {
    args.jobLog(`[${index}] - ${getCropInfoString(cropInfo)}`);
  });
  args.jobLog('<========== frequency data ==========>');
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
  args.jobLog(`crop info frequencies: ${JSON.stringify(cropValueFrequency)}`);
  args.jobLog(`crop info width frequencies: ${JSON.stringify(cropWidthFrequency)}`);
  args.jobLog(`crop info x-offset frequencies: ${JSON.stringify(cropXOffsetFrequency)}`);
  args.jobLog(`crop info height frequencies: ${JSON.stringify(cropHeightFrequency)}`);
  args.jobLog(`crop info y-offset frequencies: ${JSON.stringify(cropYOffsetFrequency)}`);
  args.jobLog('<=============== end ===============>');
  return cropValues;
};

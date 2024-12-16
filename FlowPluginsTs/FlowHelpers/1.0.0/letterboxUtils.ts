import { IpluginInputArgs } from './interfaces/interfaces';
import { CLI } from './cliUtils';

export class CropInfo {
  // width
  w: number = 0;

  // height
  h: number = 0;

  // x offset
  x: number = 0;

  // y offset
  y: number = 0;

  // constructor
  constructor(w: number, h: number = 0, x: number = 0, y: number = 0) {
    this.w = w;
    this.h = h;
    this.x = x;
    this.y = y;
  }

  // toString
  toString = (): string => `${this.w}:${this.h}:${this.x}:${this.y}`;
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
  // return a list of crop settings
  return res.errorLogFull.filter((line) => line.startsWith('[Parsed_cropdetect_'))
    .map((line) => cropRegex.exec(line)?.[1])
    .filter((line) => line)
    .map((value) => {
      const split: string[] = String(value).split(':');
      return new CropInfo(Number(split[0] ?? 0), Number(split[1] ?? 0), Number(split[2] ?? 0), Number(split[3] ?? 0));
    });
};

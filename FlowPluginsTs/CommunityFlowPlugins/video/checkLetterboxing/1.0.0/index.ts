import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import { CLI } from '../../../../FlowHelpers/1.0.0/cliUtils';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
  name: 'Check Letterboxing',
  description:
    `
    Check if video is letterboxed. Options below allow control over how this region is detected, mostly to allow for 
    configuring a balance between the cost of the calculation and the accuracy. By default it tries to be conservative, 
    only treating it as letterbox if quite noticeably so, and averaging multiple samples to calculate the active frame 
    area. 
    `,
  style: {
    borderColor: 'orange',
  },
  tags: 'video',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: 'faQuestion',
  inputs: [
    {
      label: 'Detection Method',
      name: 'detectMethod',
      type: 'string',
      defaultValue: 'mvedges',
      inputUI: {
        type: 'dropdown',
        options: [
          'mvedges',
          'black_borders',
        ],
      },
      tooltip:
        `
        Specify the ffmpeg method to use to detect if the video is letterboxed. 
        \n\n
        \n\n
        mvedges - generate motion vectors and use those to detect the active region. 
        \n\n
        black_borders - detect the regions that are solid black. 
        \n\n
        \n\n
        While testing this I found 'mvedges' to be slower, but more consistent. 
        `,
    },
    {
      label: 'Sample Length',
      name: 'sampleLength',
      type: 'number',
      defaultValue: '60',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Specify the length (in seconds) of each sample to take when running the ffmpeg scans.',
    },
    {
      label: 'Sample Count',
      name: 'sampleCount',
      type: 'number',
      defaultValue: '5',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Specify the number of randomly-distributed samples to take',
    },
    {
      label: 'Start Offset',
      name: 'startOffset',
      type: 'number',
      defaultValue: '300',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Offset (in seconds) from the beginning of the video to avoid scanning the intro.',
    },
    {
      label: 'End Offset',
      name: 'endOffset',
      type: 'number',
      defaultValue: '300',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Offset (in seconds) from the end of the video to avoid scanning the outro.',
    },
  ],
  outputs: [
    {
      number: 1,
      tooltip: 'File is HDR',
    },
    {
      number: 2,
      tooltip: 'File is not HDR',
    },
  ],
});

const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);
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
  // grep for relevant lines
  spawnArgs.push('|', 'grep', 'Parsed_cropdetect_');
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
  // get a list of crop settings
  const cropValues: CropInfo[] = res.errorLogFull.map((line) => cropRegex.exec(line)?.[1]).filter((line) => line)
    .map((value) => {
      const split: string[] = String(value).split(':');
      return new CropInfo(Number(split[0] ?? 0), Number(split[1] ?? 0), Number(split[2] ?? 0), Number(split[3] ?? 0));
    });
  // build a map of frequency
  const cropValueFrequency: { [key: string]: number } = {};
  cropValues.forEach((value) => {
    cropValueFrequency[value.toString()] = (cropValueFrequency[value.toString()] ?? 0) + 1;
  });
  // logs
  args.jobLog('<========== scan complete ==========>');
  args.jobLog(`frequencies: ${JSON.stringify(cropValueFrequency)}`);
  args.jobLog('<========== raw crop data ==========>');
  cropValues.forEach((detail: CropInfo, index: number) => {
    args.jobLog(`[${index}] - ${detail.toString()}`);
  });
  args.jobLog('<========== logs complete ==========>');
  return {
    outputFileObj: args.inputFileObj,
    outputNumber: 1,
    variables: args.variables,
  };
};

export {
  details,
  plugin,
};

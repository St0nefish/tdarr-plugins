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
  const cropRegex: RegExp = /.*(?<=crop=)([0-9]+:[0-9]+:[0-9]+:[0-9]+).*/gm;
  // build ffmpeg command
  const spawnArgs: string[] = [];
  // always hide banner and stats
  spawnArgs.push('-hide_banner', '-nostats');
  // set start offset
  spawnArgs.push('-ss', '300');
  // set sample length
  spawnArgs.push('-t', '4');
  // set input file
  spawnArgs.push('-i', args.inputFileObj._id);
  // set cropdetect settings
  spawnArgs.push('-vf', 'cropdetect,metadata=mode=print');
  // no output file
  spawnArgs.push('-f', 'null', '2>&1');
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
  // logs
  res.errorLogFull.filter((line) => line.startsWith('[Parsed_cropdetect_')).forEach((line: string, index: number) => {
    const match = cropRegex.exec(line);
    if (match) {
      args.jobLog(`[${index}] - ${match[1]}`);
    }
    args.jobLog(`[${index}] - ${line}`);
  });
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

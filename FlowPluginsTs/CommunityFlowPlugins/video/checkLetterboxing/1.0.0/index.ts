import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import { CLI } from '../../../../FlowHelpers/1.0.0/cliUtils';
import {
  CropInfo,
  getCropInfo
} from '../../../../FlowHelpers/1.0.0/letterboxUtils';

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
  // get a list of crop settings
  const cropValues: CropInfo[] = await getCropInfo(args);
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

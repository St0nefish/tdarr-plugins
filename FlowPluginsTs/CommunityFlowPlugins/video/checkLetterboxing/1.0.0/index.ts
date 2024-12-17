import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import {
  CropInfo,
  getCropInfo,
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
      label: 'Start Offset Percentage',
      name: 'startOffsetPct',
      type: 'number',
      defaultValue: '5',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Offset (in percent of runtime) from the beginning of the video to avoid scanning the intro.',
    },
    {
      label: 'End Offset Percentage',
      name: 'endOffsetPct',
      type: 'number',
      defaultValue: '5',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Offset (in percent of runtime) from the end of the video to avoid scanning the outro.',
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
      label: 'Relevant Sample Percentage',
      name: 'relevantPct',
      type: 'number',
      defaultValue: '5',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Percent of the sampled frames with a given framerate detected for it to be considered relevant',
    },
  ],
  outputs: [
    {
      number: 1,
      tooltip: 'File requires cropping',
    },
    {
      number: 2,
      tooltip: 'File does not require cropping',
    },
  ],
});

const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);
  // get a list of crop settings
  const startOffsetPct: number = Number(args.inputs.startOffsetPct);
  const endOffsetPct: number = Number(args.inputs.endOffsetPct);
  const sampleCount: number = Number(args.inputs.sampleCount);
  const relevantPct: number = Number(args.inputs.relevantPct);
  // execute cropdetect
  const cropInfo: CropInfo = await getCropInfo(
    args,
    args.inputFileObj,
    true,
    'conservative',
    startOffsetPct,
    endOffsetPct,
    2,
    2,
  );
  args.jobLog(`calculated crop info: ${JSON.stringify(cropInfo)}`);

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

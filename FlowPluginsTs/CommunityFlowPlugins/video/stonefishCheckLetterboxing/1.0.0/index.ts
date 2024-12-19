import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import {
  CropInfo,
  HandBrakeCropScanConfig,
} from '../../../../FlowHelpers/1.0.0/letterboxUtils';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
  name: 'Stonefish Check Letterboxing',
  description:
    `
    Check if the input video is letterboxed. 
    \n\n
    The various options allow control over how this region is detected. Detection is done using HandBrake's 
    \`--crop-mode --scan\` options. This works by extracting a number of sample images then scanning those to detect 
    the black bars around the outside. The number of sample images will be calculated by determining the duration of 
    video scanned after accounting for start and end offsets and dividing that time by the configured "Seconds per 
    Preview" setting. The 'Minimum Crop Percentage' setting is used to avoid attempting to crop a video if the 
    calculated crop settings are below that threshold. For example, if left at the default 2%, then for a 1080p video 
    this plugin will only specify that letterboxing is detected if the HandBrake scan determines that at least 22 
    pixels would be removed from the height. 
    \n\n
    Note 1: This only works properly for files containing a single video stream, this seems to be a limitation of 
    HandBrake. 
    \n\n
    Note 2: Hardware decoding is a work-in-progress, I have only tested and confirmed it to be working on NVIDIA GPUs, 
    but it *does* make a noticeable difference when enabled. My very basic testing shows enabling it to about half the 
    total execution time compared to a CPU-only scan. 
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
      label: 'Crop Detection Mode',
      name: 'cropMode',
      type: 'string',
      defaultValue: 'conservative',
      inputUI: {
        type: 'dropdown',
        options: [
          'auto',
          'conservative',
        ],
      },
      tooltip: 'Select Handbrake crop detection mode',
    },
    {
      label: 'Seconds Per Preview',
      name: 'secondsPerPreview',
      type: 'number',
      defaultValue: '30',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Average number of seconds of video per preview',
    },
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
      label: 'Minimum Crop Percentage',
      name: 'minCropPct',
      type: 'number',
      defaultValue: '2',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Percent change in dimension in order to justify cropping',
    },
    {
      label: 'Enable Hardware Decoding',
      name: 'enableHwDecoding',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip: 'Specify whether to use hardware decoding if available',
    },
    {
      label: 'Hardware Decoder',
      name: 'hwDecoder',
      type: 'string',
      defaultValue: 'auto',
      inputUI: {
        type: 'dropdown',
        options: [
          'auto',
          'nvdec',
          'qsv',
          'vaapi',
        ],
        displayConditions: {
          logic: 'AND',
          sets: [
            {
              logic: 'AND',
              inputs: [
                {
                  name: 'enableHwDecoding',
                  condition: '===',
                  value: 'true',
                },
              ],
            },
          ],
        },
      },
      tooltip:
        `
        Specify hardware encoder to use. Auto mode really just detects nvidia right now and enables nvdec, and 
        potentially qsv if the decoder shares the same name. I'm struggling to find available input options to populate
        this.
        `,
    },
    {
      label: 'Store Results to Flow Variables',
      name: 'storeCropSettings',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip:
        `
        Specify whether to store the crop detection results to user variables for use by subsequent plugins. This will 
        be stored as a JSON version of the CropInfo object from the letterboxUtils file on the 
        \`args.variables.user.crop_object\` variable (used by the Stonefish Set Video Encoder plugin), and in the form 
        of ffmpeg (width:height:x:y) and HandBrake (top/bottom/left/right) crop arguments, which can be used by 
        referencing the \`args.variables.user.crop_ffmpeg\` or \`args.variables.user.crop_handbrake\` variables. This 
        can allow for a slight performance optimization if there is a need to control the flow based on the letterbox 
        state and subsequently remove that letterboxing without re-running the scan. 
        `,
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
  // create configuration object for running Handbrake cropdetect scan
  const scanConfig: HandBrakeCropScanConfig = {
    cropMode: String(args.inputs.cropMode),
    secondsPerPreview: Number(args.inputs.secondsPerPreview),
    startOffsetPct: Number(args.inputs.startOffsetPct),
    endOffsetPct: Number(args.inputs.endOffsetPct),
    minCropPct: Number(args.inputs.minCropPct ?? 0),
    enableHwDecoding: Boolean(args.inputs.enableHwDecoding),
    hwDecoder: String(args.inputs.hwDecoder),
  };
  // execute cropdetect
  const cropInfo: CropInfo = await CropInfo.fromHandBrakeScan(args, args.inputFileObj, scanConfig);
  // log results
  args.jobLog(`calculated crop info: ${JSON.stringify(cropInfo)}`);
  args.jobLog(`ffmpeg crop string: [${cropInfo.getFfmpegCropString()}]`);
  args.jobLog(`handbrake crop string: [${cropInfo.getHandBrakeCropString()}]`);
  // store result if specified
  if (args.inputs.storeCropSettings) {
    // ensure user variable object exists
    // eslint-disable-next-line no-param-reassign
    args.variables.user ??= {};
    // then set our crop info details
    // eslint-disable-next-line no-param-reassign
    args.variables.user.crop_object = JSON.stringify(cropInfo);
    // eslint-disable-next-line no-param-reassign
    args.variables.user.crop_ffmpeg = cropInfo.getFfmpegCropString();
    // eslint-disable-next-line no-param-reassign
    args.variables.user.crop_handbrake = cropInfo.getHandBrakeCropString();
  }
  // determine output number
  const outputNumber = cropInfo.shouldCrop() ? 1 : 2;
  // return
  return {
    outputFileObj: args.inputFileObj,
    outputNumber,
    variables: args.variables,
  };
};

export {
  details,
  plugin,
};

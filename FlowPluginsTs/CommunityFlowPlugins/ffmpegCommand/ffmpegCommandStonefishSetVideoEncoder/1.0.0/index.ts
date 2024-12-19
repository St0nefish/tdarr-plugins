/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
import { getEncoder } from '../../../../FlowHelpers/1.0.0/hardwareUtils';
import { checkFfmpegCommandInit } from '../../../../FlowHelpers/1.0.0/interfaces/flowUtils';
import {
  IffmpegCommandStream,
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import { isVideo } from '../../../../FlowHelpers/1.0.0/metadataUtils';
import { getContainer } from '../../../../FlowHelpers/1.0.0/fileUtils';
import { CropInfo } from '../../../../FlowHelpers/1.0.0/letterboxUtils';

/* eslint-disable no-param-reassign */
const details = (): IpluginDetails => ({
  name: 'Stonefish Set Video Encoder',
  description:
    `
     Configure the video encoder settings 
     \n\n
     See the following resources for more details on what these settings do:
     \n\n
     - https://trac.ffmpeg.org/wiki/Encode/H.264
     \n\n
     - https://trac.ffmpeg.org/wiki/Encode/H.265
     \n\n
     - https://trac.ffmpeg.org/wiki/Encode/AV1
     \n\n
     Credit to the default ffmpegCommandSetVideoEncoder plugin. I forked it to add options to control the title 
     behavior and change default values to match my personal preference.
     `,
  style: {
    borderColor: '#6efefc',
  },
  tags: 'video',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: '',
  inputs: [
    {
      label: 'Output Container',
      name: 'outputContainer',
      type: 'string',
      defaultValue: 'mkv',
      inputUI: {
        type: 'dropdown',
        options: [
          'mkv',
          'mp4',
        ],
      },
      tooltip: 'Specify the container to use',
    },
    {
      label: 'Output Resolution',
      name: 'outputResolution',
      type: 'string',
      defaultValue: '1080p',
      inputUI: {
        type: 'dropdown',
        options: [
          '480p',
          '720p',
          '1080p',
          '1440p',
          '4KUHD',
        ],
      },
      tooltip: 'Specify the codec to use',
    },
    {
      label: 'Output Codec',
      name: 'outputCodec',
      type: 'string',
      defaultValue: 'hevc',
      inputUI: {
        type: 'dropdown',
        options: [
          'hevc',
          'h264',
          'av1',
        ],
      },
      tooltip: 'Specify codec of the output file',
    },
    {
      label: 'Enable FFmpeg Preset',
      name: 'ffmpegPresetEnabled',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip: 'Specify whether to use an FFmpeg preset',
    },
    {
      label: 'FFmpeg Preset',
      name: 'ffmpegPreset',
      type: 'string',
      defaultValue: 'slow',
      inputUI: {
        type: 'dropdown',
        options: [
          'veryslow',
          'slower',
          'slow',
          'medium',
          'fast',
          'faster',
          'veryfast',
          'superfast',
          'ultrafast',
        ],
        displayConditions: {
          logic: 'AND',
          sets: [
            {
              logic: 'AND',
              inputs: [
                {
                  name: 'ffmpegPresetEnabled',
                  value: 'true',
                  condition: '===',
                },
              ],
            },
          ],
        },
      },
      tooltip: 'Specify ffmpeg preset',
    },
    {
      label: 'Enable FFmpeg Quality',
      name: 'ffmpegQualityEnabled',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip: 'Specify whether to set crf (or qp for GPU encoding)',
    },
    {
      label: 'FFmpeg Quality',
      name: 'ffmpegQuality',
      type: 'number',
      defaultValue: '20',
      inputUI: {
        type: 'text',
        displayConditions: {
          logic: 'AND',
          sets: [
            {
              logic: 'AND',
              inputs: [
                {
                  name: 'ffmpegQualityEnabled',
                  value: 'true',
                  condition: '===',
                },
              ],
            },
          ],
        },
      },
      tooltip: 'Specify ffmpeg quality crf (or qp for GPU encoding)',
    },
    {
      label: 'Hardware Encoding',
      name: 'hardwareEncoding',
      type: 'boolean',
      defaultValue: 'false',
      inputUI: {
        type: 'switch',
      },
      tooltip: 'Specify whether to use hardware encoding if available',
    },
    {
      label: 'Hardware Type',
      name: 'hardwareType',
      type: 'string',
      defaultValue: 'auto',
      inputUI: {
        type: 'dropdown',
        options: [
          'auto',
          'nvenc',
          'qsv',
          'vaapi',
          'videotoolbox',
        ],
      },
      tooltip: 'Specify hardware encoder to use',
    },
    {
      label: 'Hardware Decoding',
      name: 'hardwareDecoding',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip: 'Specify whether to use hardware decoding if available',
    },
    {
      label: 'Force Encoding',
      name: 'forceEncoding',
      type: 'boolean',
      defaultValue: 'false',
      inputUI: {
        type: 'switch',
      },
      tooltip: 'Specify whether to force encoding if stream already has the target codec',
    },
    {
      label: 'Title Behavior',
      name: 'titleMode',
      type: 'string',
      defaultValue: 'clear',
      inputUI: {
        type: 'dropdown',
        options: [
          'default',
          'clear',
          'generate',
        ],
      },
      tooltip:
        `
        Specify how to handle the title of the resulting stream
        \n\n
        - default : defer to the default ffmpeg behavior
        \n\n
        - clear : clear the title value
        \n\n
        - generate : generate a title from {codec}
        `,
    },
    {
      label: 'Enable Letterbox Removal',
      name: 'enableLetterboxRemoval',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip: 'Specify whether to enable letterbox removal',
    },
    {
      label: 'Load Crop Info from Flow Variables',
      name: 'loadCropSettings',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
        displayConditions: {
          logic: 'AND',
          sets: [
            {
              logic: 'AND',
              inputs: [
                {
                  name: 'enableLetterboxRemoval',
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
        Specify whether to load crop configuration from a flow variable. If the "Stonefish Check Letterboxing" plugin 
        is used earlier in the flow with the "Save Crop Info to Flow Variables" option enabled then enabling this 
        option will cause this plugin to grab that saved data from the flow variables and use it to avoid re-running 
        the HandBrake scan. Basic validation will be performed to check that the input dimensions match those of the 
        current file in case another transcode has happened between the detect plugin and this one rendering the prior 
        results invalid. If prior results are not present or not still relevant then a new scan will be executed. 
        `,
    },
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
        displayConditions: {
          logic: 'AND',
          sets: [
            {
              logic: 'AND',
              inputs: [
                {
                  name: 'enableLetterboxRemoval',
                  condition: '===',
                  value: 'true',
                },
              ],
            },
          ],
        },
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
        displayConditions: {
          logic: 'AND',
          sets: [
            {
              logic: 'AND',
              inputs: [
                {
                  name: 'enableLetterboxRemoval',
                  condition: '===',
                  value: 'true',
                },
              ],
            },
          ],
        },
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
        displayConditions: {
          logic: 'AND',
          sets: [
            {
              logic: 'AND',
              inputs: [
                {
                  name: 'enableLetterboxRemoval',
                  condition: '===',
                  value: 'true',
                },
              ],
            },
          ],
        },
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
        displayConditions: {
          logic: 'AND',
          sets: [
            {
              logic: 'AND',
              inputs: [
                {
                  name: 'enableLetterboxRemoval',
                  condition: '===',
                  value: 'true',
                },
              ],
            },
          ],
        },
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
        displayConditions: {
          logic: 'AND',
          sets: [
            {
              logic: 'AND',
              inputs: [
                {
                  name: 'enableLetterboxRemoval',
                  condition: '===',
                  value: 'true',
                },
              ],
            },
          ],
        },
      },
      tooltip: 'Percent change in dimension in order to justify cropping',
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
                  name: 'enableLetterboxRemoval',
                  condition: '===',
                  value: 'true',
                },
                {
                  name: 'hardwareDecoding',
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
  ],
  outputs: [
    {
      number: 1,
      tooltip: 'Continue to next plugin',
    },
  ],
});

// function to get vf options by resolution - defaults to 1080p
const getVfScaleArgs = (targetResolution: string): string[] => {
  switch (targetResolution) {
    case '480p':
      return ['-vf', 'scale=720:-2'];
    case '576p':
      return ['-vf', 'scale=720:-2'];
    case '720p':
      return ['-vf', 'scale=1280:-2'];
    case '1080p':
      return ['-vf', 'scale=1920:-2'];
    case '1440p':
      return ['-vf', 'scale=2560:-2'];
    case '4KUHD':
      return ['-vf', 'scale=3840:-2'];
    default:
      return ['-vf', 'scale=1920:-2'];
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);
  // ensure ffmpeg command was initiated
  checkFfmpegCommandInit(args);
  // grab transcoding config
  const outputContainer: string = String(args.inputs.outputContainer);
  const outputResolution: string = String(args.inputs.outputResolution);
  const outputCodec: string = String(args.inputs.outputCodec);
  const hardwareDecoding: boolean = Boolean(args.inputs.hardwareDecoding);
  const ffmpegPresetEnabled: boolean = Boolean(args.inputs.ffmpegPresetEnabled);
  const ffmpegQualityEnabled: boolean = Boolean(args.inputs.ffmpegQualityEnabled);
  const ffmpegPreset: string = String(args.inputs.ffmpegPreset);
  const ffmpegQuality: string = String(args.inputs.ffmpegQuality);
  const forceEncoding: boolean = Boolean(args.inputs.forceEncoding);
  const hardwareEncoding: boolean = Boolean(args.inputs.hardwareEncoding);
  const hardwareType: string = String(args.inputs.hardwareType);
  const titleMode: string = String(args.inputs.titleMode);
  // and load letterbox crop settings if enabled
  let cropInfo: CropInfo | null = null;
  if (args.inputs.enableLetterboxRemoval) {
    // if enabled attempt to load crop info from variable
    if (args.inputs.loadCropSettings) {
      cropInfo = CropInfo.fromJsonString(args.variables.user.crop_object);
    }
    // if nothing was loaded or the loaded object isn't still relevant then run a scan
    if (!cropInfo?.isRelevant(args.inputFileObj)) {
      cropInfo = await CropInfo.fromHandBrakeScan(
        args,
        args.inputFileObj,
        {
          cropMode: String(args.inputs.cropMode),
          secondsPerPreview: Number(args.inputs.secondsPerPreview),
          startOffsetPct: Number(args.inputs.startOffsetPct),
          endOffsetPct: Number(args.inputs.endOffsetPct),
          enableHwDecoding: Boolean(args.inputs.hardwareDecoding),
          hwDecoder: String(args.inputs.hwDecoder),
        },
      );
    }
  }
  // load encoder configuration
  const encoderProperties = await getEncoder({
    targetCodec: outputCodec,
    hardwareEncoding,
    hardwareType,
    args,
  });
  // first handle container if not already correct
  if (getContainer(args.inputFileObj._id) !== outputContainer) {
    args.variables.ffmpegCommand.shouldProcess = true;
    args.variables.ffmpegCommand.container = outputContainer;
    // generate missing PTS if coming from certain containers and DTS is present
    const container = args.inputFileObj.container.toLowerCase();
    if (['ts', 'avi', 'mpg', 'mpeg'].includes(container)) {
      args.variables.ffmpegCommand.overallOuputArguments.push('-fflags', '+genpts');
    }
  }
  // handle cropping if required
  if (cropInfo?.shouldCrop(Number(args.inputs.minCropPct))) {
    args.variables.ffmpegCommand.overallOuputArguments.push('-vf', `crop=${cropInfo?.getFfmpegCropString()}`);
  }
  // iterate streams, filter to video, and configure encoding options
  args.variables.ffmpegCommand.streams.filter(isVideo).forEach((stream: IffmpegCommandStream) => {
    // only encode if forced or codec isn't already correct
    if (forceEncoding || stream.codec_name !== outputCodec) {
      // enable processing and set hardware decoding
      args.variables.ffmpegCommand.shouldProcess = true;
      args.variables.ffmpegCommand.hardwareDecoding = hardwareDecoding;
      // set this stream to be output
      stream.outputArgs.push('-c:{outputIndex}');
      // set encoder to use
      stream.outputArgs.push(encoderProperties.encoder);
      // handle resolution if necessary
      if (outputResolution !== args.inputFileObj.video_resolution) {
        stream.outputArgs.push(...getVfScaleArgs(outputResolution));
      }
      // handle configured quality settings
      if (ffmpegQualityEnabled) {
        if (encoderProperties.isGpu) {
          stream.outputArgs.push('-qp', ffmpegQuality);
        } else {
          stream.outputArgs.push('-crf', ffmpegQuality);
        }
      }
      // handle configured preset
      if (ffmpegPresetEnabled) {
        if (outputCodec !== 'av1' && ffmpegPreset) {
          stream.outputArgs.push('-preset', ffmpegPreset);
        }
      }
      // handle hardware decoding options
      if (hardwareDecoding) {
        stream.inputArgs.push(...encoderProperties.inputArgs);
      }
      // push remaining encoder output args
      if (encoderProperties.outputArgs) {
        stream.outputArgs.push(...encoderProperties.outputArgs);
      }
      // handle title removal or generation
      if (titleMode === 'clear') {
        stream.outputArgs.push('-metadata:s:v:{outputTypeIndex}', 'title=');
      } else if (titleMode === 'generate') {
        stream.outputArgs.push('-metadata:s:v:{outputTypeIndex}', `title=${outputCodec}`);
      }
    }
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

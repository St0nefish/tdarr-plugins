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

/* eslint-disable no-param-reassign */
const details = (): IpluginDetails => ({
  name: 'Set Video Encoder (stonefish)',
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
  // grab config
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
  // load encoder options
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
    // handle genpts if coming from odd container
    const container = args.inputFileObj.container.toLowerCase();
    if (['ts', 'avi', 'mpg', 'mpeg'].includes(container)) {
      args.variables.ffmpegCommand.overallOuputArguments.push('-fflags', '+genpts');
    }
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

import { checkFfmpegCommandInit } from '../../../../FlowHelpers/1.0.0/interfaces/flowUtils';
import {
  IffmpegCommandStream,
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import {
  generateTitleForStream,
  getCodecType,
  getMediaInfo,
  getMediaInfoTrack,
  getStreamTypeFlag,
  getTitle,
  hasCommentaryFlag,
  hasDescriptiveFlag,
  isAudio,
  isCommentaryStream,
  isDescriptiveStream,
  isForcedSubtitle,
  isLanguageUndefined,
  isStandardStream,
  isSubtitle,
  isVideo,
  setTypeIndexes,
} from '../../../../FlowHelpers/1.0.0/metadataUtils';
import { ImediaInfo } from '../../../../FlowHelpers/1.0.0/interfaces/synced/IFileObject';

/* eslint-disable no-param-reassign */
const details = (): IpluginDetails => ({
  name: 'Stonefish Tag Streams',
  description:
    `
    Add missing tags. 
    \n\n
    Checks all streams for missing titles, and optionally overwrites existing ones with new ones generated from current
    title metadata. 
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
      label: 'Force New Titles for Standard Streams',
      name: 'forceTitles',
      type: 'boolean',
      defaultValue: 'false',
      inputUI: {
        type: 'switch',
      },
      tooltip:
        `
        Specify whether to forcibly re-generate all video, audio, and subtitle stream titles. 
        \n\n
        This may help if the existing tags include now-outdated info on codec, bitrate, etc. By default this will not be
        applied to descriptive or commentary streams which already have a title. See the below flags to force those as 
        well. 
        `,
    },
    {
      label: 'Force New Titles for Commentary Streams',
      name: 'forceTitleCommentary',
      type: 'boolean',
      defaultValue: 'false',
      inputUI: {
        type: 'switch',
      },
      tooltip:
        `
        Specify whether to forcibly re-generate stream titles for streams that are commentary. 
        \n\n
        Many commentary streams already have descriptive titles rather than codec/bitrate information. 
        `,
    },
    {
      label: 'Force New Titles for Descriptive Streams',
      name: 'forceTitleDescriptive',
      type: 'boolean',
      defaultValue: 'false',
      inputUI: {
        type: 'switch',
      },
      tooltip:
        `
        Specify whether to forcibly re-generate stream titles for streams that are descriptive. 
        \n\n
        Many descriptive streams already have descriptive titles rather than codec/bitrate information. 
        `,
    },
    {
      label: 'Set Language Tag',
      name: 'setLangTag',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip: 'Specify whether to set language tags on streams where it is missing.',
    },
    {
      label: 'Language Tag',
      name: 'tagLanguage',
      type: 'string',
      defaultValue: 'eng',
      inputUI: {
        type: 'text',
        displayConditions: {
          logic: 'AND',
          sets: [
            {
              logic: 'AND',
              inputs: [
                {
                  name: 'setLangTag',
                  value: 'true',
                  condition: '===',
                },
              ],
            },
          ],
        },
      },
      tooltip: 'Enter the language tag to use for untagged streams.',
    },
    {
      label: 'Set Disposition Flags',
      name: 'setDisposition',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip:
        `
        Specify whether to set missing disposition flags. 
        \n\n
        If a stream has 'commentary', 'descriptive', or 'sdh' in the title but is missing the appropriate disposition 
        flag then set these flags. Additionally, if a video or audio stream is the first one but it does not have the
        'default' flag set then enable it. 
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);
  // ensure ffmpeg command has been initialized
  checkFfmpegCommandInit(args);
  // options for tagging missing languages
  const setTagLanguage: boolean = Boolean(args.inputs.setLangTag);
  const tagLanguage: string = setTagLanguage ? String(args.inputs.tagLanguage) : 'eng';
  // options for forcing new stream titles
  const forceTitle: boolean = Boolean(args.inputs.forceTitles);
  const forceTitleCommentary: boolean = Boolean(args.inputs.forceTitleCommentary);
  const forceTitleDescriptive: boolean = Boolean(args.inputs.forceTitleDescriptive);
  // options for managing disposition flags
  const setDisposition: boolean = Boolean(args.inputs.setDisposition);
  // grab a handle to streams and set type indexes
  const streams: IffmpegCommandStream[] = args.variables.ffmpegCommand.streams;
  setTypeIndexes(streams);
  // execute a mediaInfo scan
  const mediaInfo: ImediaInfo | undefined = await getMediaInfo(args);
  // iterate streams to flag the ones to remove
  streams.forEach((stream) => {
    const codecType: string = getCodecType(stream);
    // copy all streams
    stream.outputArgs.push('-c:{outputIndex}', 'copy');
    // add tags for video, audio, subtitle streams
    if (isVideo(stream) || isAudio(stream) || isSubtitle(stream)) {
      // check if language tag is missing
      if (setTagLanguage && isLanguageUndefined(stream)) {
        args.jobLog(`found [${codecType}] stream missing language tag - setting to [${tagLanguage}]`);
        // ensure tags object exists and set language tag
        stream.tags ??= {};
        stream.tags.language = tagLanguage;
        // set shouldProcess
        args.variables.ffmpegCommand.shouldProcess = true;
        // add ffmpeg args to tag the file
        stream.outputArgs.push(`-metadata:s:${getStreamTypeFlag(stream)}:{outputTypeIndex}`, `language=${tagLanguage}`);
      }
      // check if we should set a stream title
      // true if title is missing or if one of the force new flags is on
      if (getTitle(stream).length === 0 // title is missing
        || (forceTitle && isStandardStream(stream)) // force new title for standard stream
        || (forceTitleCommentary && isCommentaryStream(stream)) // force new title for commentary
        || (forceTitleDescriptive && isDescriptiveStream(stream)) // force new title for descriptive
      ) {
        // generate a title for this stream
        const title: string = generateTitleForStream(stream, getMediaInfoTrack(stream, mediaInfo));
        args.jobLog(`found [${codecType}] stream that requires a title - setting to [${title}]`);
        // ensure tags object exists and set title tag
        stream.tags ??= {};
        stream.tags.title = title;
        // set shouldProcess
        args.variables.ffmpegCommand.shouldProcess = true;
        // add ffmpeg args to tag the file
        stream.outputArgs.push(`-metadata:s:${getStreamTypeFlag(stream)}:{outputTypeIndex}`, `title=${title}`);
      }
    }
    // handle disposition flags if enabled
    if (setDisposition) {
      // array of flags to add or remove
      const flags: string[] = [];
      // ensure first video and audio streams have default flag set
      if ((isVideo(stream) || isAudio(stream)) && stream.typeIndex === 0 && !stream.disposition.default) {
        args.jobLog(`found [${codecType}] stream that is first but not set as default`);
        // add the default flag
        flags.push('+default');
      }
      // handle commentary streams
      if (hasCommentaryFlag(stream) && !stream.disposition?.comment) {
        args.jobLog(`found [${codecType}] stream that requires the comment disposition flag`);
        // add comment flag
        flags.push('+comment');
      }
      // handle descriptive streams
      if (hasDescriptiveFlag(stream) && !stream.disposition?.descriptions) {
        args.jobLog(`found [${codecType}] stream that requires the descriptions disposition flag`);
        // add descriptions tag
        flags.push('+descriptions');
      }
      // remove default flag from non-standard streams
      if (!isStandardStream(stream) && stream.disposition.default) {
        flags.push('-default');
      }
      // handle default and forced flags for subtitles
      if (isSubtitle(stream)) {
        // remove default flag from any non-forced streams
        if (isForcedSubtitle(stream)) {
          flags.push('-default');
        }
        // add forced and default flags if title contains 'forced' but flags are not set
        if (!(stream.disposition?.forced ?? false) && isForcedSubtitle(stream)) {
          flags.push('+forced');
        }
      }
      // add forced flag if title contains forced
      // if any flag alterations are required construct the command
      if (flags.length > 0) {
        // set shouldProcess
        args.variables.ffmpegCommand.shouldProcess = true;
        // add ffmpeg args to set the flag(s)
        stream.outputArgs.push(`-disposition:${getStreamTypeFlag(stream)}:{outputTypeIndex}`, `${flags.join('')}`);
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

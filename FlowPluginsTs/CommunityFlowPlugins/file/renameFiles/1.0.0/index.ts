/* eslint-disable max-len
   ----------------------
   some example file names and regexes are longer than the max
*/

import path, { ParsedPath } from 'path';
import fs from 'fs';
import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import {
  getChannelsName,
  getFileCodecName,
  getMediaInfoTrack,
  getResolutionName,
  isAudio,
  isVideo,
} from '../../../../FlowHelpers/1.0.0/metadataUtils';
import {
  ImediaInfo,
  ImediaInfoTrack,
  Istreams,
} from '../../../../FlowHelpers/1.0.0/interfaces/synced/IFileObject';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
  name: 'Rename Files',
  description:
    `
    Renames the primary video file and optionally any associated files in the same directory which use the same root 
    name but different extensions. This can be useful for updating your file name(s) to match codecs, resolutions, etc 
    after running through tdarr and potentially changing those values. 
    \n\n
    Credit to [schadis's Tdarr_Plugin_rename_based_on_codec_schadi plugin]
    (https://github.com/schadis/Tdarr_Plugins/blob/master/Community/Tdarr_Plugin_scha_rename_based_on_codec_schadi.js)
    for influence and several of the regexes and maps used for renaming. I've extended it to support resolution and
    channel layouts in the rename and to convert to a flow plugin. 
    `,
  style: {
    borderColor: 'green',
  },
  tags: 'video',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: '',
  inputs: [
    {
      label: 'Replace Video Codec',
      name: 'replaceVideoCodec',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip:
        `
        Toggle whether to replace the video codec name in the file(s). 
        \n\n
        For example, if you've re-encoded from h264/AVC to h265/HEVC then 'h264', 'x264', or 'AVC' in the file name(s) 
        will be replaced with 'H265' or 'x265' depending on if we can determine which encoder was used. New metadata 
        will be retrieved from the first video stream if multiple are present. 
        `,
    },
    {
      label: 'Replace Video Resolution',
      name: 'replaceVideoRes',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip:
        `
        Toggle whether to replace the video resolution in the file(s). 
        \n\n
        For example, if you chose to encode a 1440p file to 1080p then references to '1440p' in the file name(s) will 
        be replaced with '1080p'. New metadata will be retrieved from the first video stream if multiple are present.
        `,
    },
    {
      label: 'Replace Audio Codec',
      name: 'replaceAudioCodec',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip:
        `
        Toggle whether to replace the audio codec name in the file(s). 
        \n\n
        For example, if you re-encoded a TrueHD audio stream down to AAC then the reference to 'TrueHD' in the file 
        name(s) will be replaced with 'AAC'. New metadata will be retrieved from the first audio stream if multiple are 
        present, so this rename can be helpful even if you only re-ordered streams. 
        `,
    },
    {
      label: 'Replace Audio Channels',
      name: 'replaceAudioChannels',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip:
        `
        Toggle whether to replace the audio channel reference in the file(s). 
        \n\n
        For example, if you re-encoded a 7.1 stream to 5.1 then references to '7.1' in the file name(s) will be 
        replaced with '5.1'. New metadata will be retrieved from the first audio stream if multiple are present, so 
        this rename can be helpful even if you only re-ordered streams.
        `,
    },
    {
      label: 'Rename Associated Files',
      name: 'renameOtherFiles',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip:
        `
        Toggle whether to rename other files in the same directory. 
        \n\n
        This will only apply to files using the same root name but with different extensions. This is mostly useful if
        you have nfo or subtitle files which use the same file naming pattern but with different extensions. 
        `,
    },
    {
      label: 'Associated File Extensions',
      name: 'fileExtensions',
      type: 'string',
      defaultValue: '',
      inputUI: {
        type: 'text',
        displayConditions: {
          logic: 'AND',
          sets: [
            {
              logic: 'AND',
              inputs: [
                {
                  name: 'renameOtherFiles',
                  value: 'true',
                  condition: '===',
                },
              ],
            },
          ],
        },
      },
      tooltip:
        `
        Enter a comma-separated list of extensions for files you wish to be renamed. If left blank this will default to
        all files matching the same naming pattern. 
        \n\n
        This will treat srt files as a special case and support files like '{name}.en.srt' or '{name}.en.forced.srt'
        `,
    },
    {
      label: 'Enable Metadata Regex',
      name: 'enableMetadataRegex',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip:
        `
        Toggle whether to enable a regex for isolating the metadata portion of the file name to be replaced. 
        \n\n
        This can be useful if your file naming pattern allows for relatively easily isolating the portion to be renamed 
        with a regex and can help prevent accidental alterations to other parts of the file name.
        `,
    },
    {
      label: 'Metadata Regex',
      name: 'metadataRegex',
      type: 'string',
      defaultValue: '.* - (?:\\{edition-\\w+(?: \\w+)*\\} )?((?:\\[.*?\\])+).*',
      inputUI: {
        type: 'text',
        displayConditions: {
          logic: 'AND',
          sets: [
            {
              logic: 'AND',
              inputs: [
                {
                  name: 'enableMetadataRegex',
                  value: 'true',
                  condition: '===',
                },
              ],
            },
          ],
        },
      },
      tooltip:
        `
        Enter a string which is used as a regex to locate the relevant portion of the file name that contains the video 
        and audio metadata to be updated. This can help prevent accidentally mutilating a file name that happens to 
        contain some bit of text that might match one of the pieces being replaced. Do not include the '/' delimiters 
        or the trailing flags. This will be converted to a proper RegExp via the constructor and always uses the 'gi' 
        flags for global/case-insensitive. 
        \n\n
        For example, my standard naming scheme is:
        \n\n
        '{title stripped of special characters} - [{video_metadata}][{audio_metadata}]-release.mkv'
        \n\n
        'The Lord of the Rings The Return of the King (2003) - {edition-extended} [Hybrid][x264 Remux-1080p][TrueHD 6.1]-FraMeSToR.mkv'
        \n\n
        Mr. Robot (2015) S01E01 eps1.0_hellofriend.mov - [x265][AMZN WEBDL-1080p Proper][EAC3 5.1]-Telly.mkv
        \n\n
        To best isolate the metadata I use the default regex above to isolate the portions with metadata in the 
        brackets and only replace data in that block. The same regex is then used to replace the old metadata block in 
        the file name(s) with the new one. 
        `,
    },
    {
      label: 'Dry Run',
      name: 'dryRun',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip:
        `
        Toggle whether to actually do the rename operation or just a dry run to log what would happen if enabled. 
        \n\n
        This can be useful for testing, especially if using the metadata regex feature.
        `,
    },
  ],
  outputs: [
    {
      number: 1,
      tooltip: 'No files were renamed',
    },
    {
      number: 2,
      tooltip: 'Files were renamed',
    },
  ],
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = (args: IpluginInputArgs): IpluginOutputArgs => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);
  // get input config
  const replaceVideoCodec: boolean = Boolean(args.inputs.replaceVideoCodec);
  const replaceVideoRes: boolean = Boolean(args.inputs.replaceVideoRes);
  const replaceAudioCodec: boolean = Boolean(args.inputs.replaceAudioCodec);
  const replaceAudioChannels: boolean = Boolean(args.inputs.replaceAudioChannels);
  const renameOtherFiles: boolean = Boolean(args.inputs.renameOtherFiles);
  const extensions: string[] = String(args.inputs.fileExtensions)
    .split(',')
    .map((item) => item?.trim())
    .filter((item) => item && item.length > 0)
    .filter((item, index, items) => items.indexOf(item) === index);
  const enableMetadataRegex: boolean = Boolean(args.inputs.enableMetadataRegex);
  const metadataRegexStr: string = String(args.inputs.metadataRegex);
  const metadataRegex: RegExp | null = enableMetadataRegex ? RegExp(metadataRegexStr, 'gi') : null;
  if (enableMetadataRegex) {
    args.jobLog(`using RegEx to locate metadata: ${metadataRegexStr}`);
  }
  const dryRun: boolean = Boolean(args.inputs.dryRun);
  // grab handles to streams and media info
  const streams: Istreams[] | undefined = args.inputFileObj.ffProbeData.streams;
  const mediaInfo: ImediaInfo | undefined = args.inputFileObj.mediaInfo;
  // regexes for replacing video & audio metadata
  const videoCodecRegex: RegExp = /(h264|h265|x264|x265|avc|hevc|mpeg2|av1|vc1)/gi;
  const videoResRegex: RegExp = /(480p|576p|720p|1080p|1440p|2160p|4320p)/gi;
  const audioCodecRegex: RegExp = /(aac|ac3|eac3|flac|mp2|mp3|truehd|truehd atmos|dts[-. ]hd[-. ]ma|dts[-. ]hd[-. ]es|dts[-. ]hd[-. ]hra|dts[-. ]express|dts)/gi;
  const audioChannelsRegex: RegExp = /(1\.0|2\.0|2\.1|3\.0|3\.1|5\.1|6\.1|7\.1)/gi;
  // get file name and path from input object
  const inputFilePath: ParsedPath = path.parse(args.inputFileObj._id);
  const inputFileName: string = inputFilePath.name;
  const inputFileDir: string = inputFilePath.dir;
  // apply renaming logic to the input file - if renaming others it should be a simple replace
  let originalMetadataStr: string = inputFileName;
  let updatedMetadataStr: string = inputFileName;
  // if using the metadata delimiter parse only the end of the file
  if (enableMetadataRegex) {
    const matches: RegExpExecArray | null = metadataRegex ? metadataRegex.exec(inputFilePath.base) : null;
    if (matches) {
      // we found a match, extract the metadata string (group 1) for updating
      updatedMetadataStr = matches[1];
      // and store the original so we can replace it in all file names
      originalMetadataStr = updatedMetadataStr;
    }
  }
  args.jobLog(`original metadata string:{{ ${updatedMetadataStr} }}`);
  // if any video-based rename is enabled
  if (replaceVideoCodec || replaceVideoRes) {
    // first find the first video stream and get its media info
    const videoStream: Istreams | undefined = streams?.filter(isVideo)[0];
    // can't proceed if we can't find a stream to use
    if (videoStream) {
      const videoMediaInfo: ImediaInfoTrack | undefined = getMediaInfoTrack(videoStream, mediaInfo);
      // handle video codec replacement if enabled
      if (replaceVideoCodec) {
        updatedMetadataStr = updatedMetadataStr.replace(videoCodecRegex, getFileCodecName(videoStream, videoMediaInfo));
      }
      // handle video resolution replacement if enabled
      if (replaceVideoRes) {
        updatedMetadataStr = updatedMetadataStr.replace(videoResRegex, getResolutionName(videoStream));
      }
    }
  }
  if (replaceAudioCodec || replaceAudioChannels) {
    const audioStream: Istreams | undefined = streams?.filter(isAudio)[0];
    // can't proceed if we can't find an audio stream to use
    if (audioStream) {
      const audioMediaInfo: ImediaInfoTrack | undefined = getMediaInfoTrack(audioStream, mediaInfo);
      // handle audio codec replacement if enabled
      if (replaceAudioCodec) {
        updatedMetadataStr = updatedMetadataStr.replace(audioCodecRegex, getFileCodecName(audioStream, audioMediaInfo));
      }
      // handle audio channels replacement if enabled
      if (replaceAudioChannels) {
        updatedMetadataStr = updatedMetadataStr.replace(audioChannelsRegex, getChannelsName(audioStream));
      }
    }
  }
  args.jobLog(`updated metadata string:{{ ${updatedMetadataStr} }}`);
  // default to the "no change" output path
  let outputNumber: number = 1;
  // check if we made any changes
  if (originalMetadataStr === updatedMetadataStr) {
    args.jobLog('no renaming required');
    return {
      outputFileObj: args.inputFileObj,
      outputNumber,
      variables: args.variables,
    };
  }
  // build a list of other files to rename
  const toRename: string[] = [inputFilePath.base];
  args.jobLog(`finding files in {{ ${inputFileDir} }} with name like {{ ${inputFileName} }}`
    + ` and extensions ${JSON.stringify(extensions)}`);
  // if enabled add other files in the directory
  if (renameOtherFiles) {
    fs.readdirSync(inputFileDir)
      .forEach((item: string) => {
        // parse path for this item
        const filePath: ParsedPath = path.parse(`${inputFileDir}/${item}`);
        // check if it's valid for rename
        if (filePath?.base?.length > 0 // valid file name
          && filePath.name.startsWith(inputFileName) // matches input file pattern
          && (extensions.length === 0 || extensions.includes(filePath.ext)) // passes extension filter
          && !toRename.includes(filePath.base) // not already in our list
        ) {
          toRename.push(filePath.base);
        }
      });
  }
  args.jobLog(`will rename files: ${JSON.stringify(toRename)}`);
  // store new primary file's path for output - default to input for dry run support
  let newPrimaryPath: string = args.inputFileObj._id;
  // iterate files
  toRename.forEach((fileName: string) => {
    // replace original metadata string with our updated one
    const newName: string = fileName.replace(originalMetadataStr, updatedMetadataStr);
    // build old and new paths
    const oldPath: string = `${inputFilePath.dir}/${fileName}`;
    const newPath: string = `${inputFilePath.dir}/${newName}`;
    if (dryRun) {
      args.jobLog(`would rename {{ ${oldPath} }} to {{ ${newPath} }}`);
    } else {
      args.jobLog(`renaming - {{ ${oldPath} }} to {{ ${newPath} }}`);
      fs.renameSync(oldPath, newPath);
      // set output to the "did rename" path
      outputNumber = 2;
      // store new path for primary file
      if (inputFilePath.base === fileName) {
        newPrimaryPath = newPath;
      }
    }
  });

  return {
    outputFileObj: {
      _id: newPrimaryPath,
    },
    outputNumber,
    variables: args.variables,
  };
};

export {
  details,
  plugin,
};

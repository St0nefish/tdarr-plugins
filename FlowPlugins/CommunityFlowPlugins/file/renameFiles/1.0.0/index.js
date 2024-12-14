"use strict";
/* eslint-disable max-len
   ----------------------
   some example file names and regexes are longer than the max
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var metadataUtils_1 = require("../../../../FlowHelpers/1.0.0/metadataUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Rename Files',
    description: "\n    Renames the primary video file and optionally any associated files in the same directory which use the same root \n    name but different extensions. This can be useful for updating your file name(s) to match codecs, resolutions, etc \n    after running through tdarr and potentially changing those values. \n    \n\n\n    Credit to [schadis's Tdarr_Plugin_rename_based_on_codec_schadi plugin]\n    (https://github.com/schadis/Tdarr_Plugins/blob/master/Community/Tdarr_Plugin_scha_rename_based_on_codec_schadi.js)\n    for influence and several of the regexes and maps used for renaming. I've extended it to support resolution and\n    channel layouts in the rename and to convert to a flow plugin. \n    ",
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
            tooltip: "\n        Toggle whether to replace the video codec name in the file(s). \n        \n\n\n        For example, if you've re-encoded from h264/AVC to h265/HEVC then 'h264', 'x264', or 'AVC' in the file name(s) \n        will be replaced with 'H265' or 'x265' depending on if we can determine which encoder was used. New metadata \n        will be retrieved from the first video stream if multiple are present. \n        ",
        },
        {
            label: 'Replace Video Resolution',
            name: 'replaceVideoRes',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n        Toggle whether to replace the video resolution in the file(s). \n        \n\n\n        For example, if you chose to encode a 1440p file to 1080p then references to '1440p' in the file name(s) will \n        be replaced with '1080p'. New metadata will be retrieved from the first video stream if multiple are present.\n        ",
        },
        {
            label: 'Replace Audio Codec',
            name: 'replaceAudioCodec',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n        Toggle whether to replace the audio codec name in the file(s). \n        \n\n\n        For example, if you re-encoded a TrueHD audio stream down to AAC then the reference to 'TrueHD' in the file \n        name(s) will be replaced with 'AAC'. New metadata will be retrieved from the first audio stream if multiple are \n        present, so this rename can be helpful even if you only re-ordered streams. \n        ",
        },
        {
            label: 'Replace Audio Channels',
            name: 'replaceAudioChannels',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n        Toggle whether to replace the audio channel reference in the file(s). \n        \n\n\n        For example, if you re-encoded a 7.1 stream to 5.1 then references to '7.1' in the file name(s) will be \n        replaced with '5.1'. New metadata will be retrieved from the first audio stream if multiple are present, so \n        this rename can be helpful even if you only re-ordered streams.\n        ",
        },
        {
            label: 'Rename Associated Files',
            name: 'renameOtherFiles',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n        Toggle whether to rename other files in the same directory. \n        \n\n\n        This will only apply to files using the same root name but with different extensions. This is mostly useful if\n        you have nfo or subtitle files which use the same file naming pattern but with different extensions. \n        ",
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
            tooltip: "\n        Enter a comma-separated list of extensions for files you wish to be renamed. If left blank this will default to\n        all files matching the same naming pattern. \n        \n\n\n        This will treat srt files as a special case and support files like '{name}.en.srt' or '{name}.en.forced.srt'\n        ",
        },
        {
            label: 'Enable Metadata Regex',
            name: 'enableMetadataRegex',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n        Toggle whether to enable a regex for isolating the metadata portion of the file name to be replaced. \n        \n\n\n        This can be useful if your file naming pattern allows for relatively easily isolating the portion to be renamed \n        with a regex and can help prevent accidental alterations to other parts of the file name.\n        ",
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
            tooltip: "\n        Enter a string which is used as a regex to locate the relevant portion of the file name that contains the video \n        and audio metadata to be updated. This can help prevent accidentally mutilating a file name that happens to \n        contain some bit of text that might match one of the pieces being replaced. Do not include the '/' delimiters \n        or the trailing flags. This will be converted to a proper RegExp via the constructor and always uses the 'gi' \n        flags for global/case-insensitive. \n        \n\n\n        For example, my standard naming scheme is:\n        \n\n\n        '{title stripped of special characters} - [{video_metadata}][{audio_metadata}]-release.mkv'\n        \n\n\n        'The Lord of the Rings The Return of the King (2003) - {edition-extended} [Hybrid][x264 Remux-1080p][TrueHD 6.1]-FraMeSToR.mkv'\n        \n\n\n        Mr. Robot (2015) S01E01 eps1.0_hellofriend.mov - [x265][AMZN WEBDL-1080p Proper][EAC3 5.1]-Telly.mkv\n        \n\n\n        To best isolate the metadata I use the default regex above to isolate the portions with metadata in the \n        brackets and only replace data in that block. The same regex is then used to replace the old metadata block in \n        the file name(s) with the new one. \n        ",
        },
        {
            label: 'Dry Run',
            name: 'dryRun',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n        Toggle whether to actually do the rename operation or just a dry run to log what would happen if enabled. \n        \n\n\n        This can be useful for testing, especially if using the metadata regex feature.\n        ",
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
}); };
exports.details = details;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) {
    var lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    // get input config
    var replaceVideoCodec = Boolean(args.inputs.replaceVideoCodec);
    var replaceVideoRes = Boolean(args.inputs.replaceVideoRes);
    var replaceAudioCodec = Boolean(args.inputs.replaceAudioCodec);
    var replaceAudioChannels = Boolean(args.inputs.replaceAudioChannels);
    var renameOtherFiles = Boolean(args.inputs.renameOtherFiles);
    var extensions = String(args.inputs.fileExtensions)
        .split(',')
        .map(function (item) { return item === null || item === void 0 ? void 0 : item.trim(); })
        .filter(function (item) { return item && item.length > 0; })
        .filter(function (item, index, items) { return items.indexOf(item) === index; });
    var enableMetadataRegex = Boolean(args.inputs.enableMetadataRegex);
    var metadataRegexStr = String(args.inputs.metadataRegex);
    var metadataRegex = enableMetadataRegex ? RegExp(metadataRegexStr, 'gi') : null;
    if (enableMetadataRegex) {
        args.jobLog("using RegEx to locate metadata: ".concat(metadataRegexStr));
    }
    var dryRun = Boolean(args.inputs.dryRun);
    // grab handles to streams and media info
    var streams = args.inputFileObj.ffProbeData.streams;
    var mediaInfo = args.inputFileObj.mediaInfo;
    // regexes for replacing video & audio metadata
    var videoCodecRegex = /(h264|h265|x264|x265|avc|hevc|mpeg2|av1|vc1)/gi;
    var videoResRegex = /(480p|576p|720p|1080p|1440p|2160p|4320p)/gi;
    var audioCodecRegex = /(aac|ac3|eac3|flac|mp2|mp3|truehd|truehd atmos|dts[-. ]hd[-. ]ma|dts[-. ]hd[-. ]es|dts[-. ]hd[-. ]hra|dts[-. ]express|dts)/gi;
    var audioChannelsRegex = /(1\.0|2\.0|2\.1|3\.0|3\.1|5\.1|6\.1|7\.1)/gi;
    // get file name and path from input object
    var inputFilePath = path_1.default.parse(args.inputFileObj._id);
    var inputFileName = inputFilePath.name;
    var inputFileDir = inputFilePath.dir;
    // apply renaming logic to the input file - if renaming others it should be a simple replace
    var originalMetadataStr = inputFileName;
    var updatedMetadataStr = inputFileName;
    // if using the metadata delimiter parse only the end of the file
    if (enableMetadataRegex) {
        var matches = metadataRegex ? metadataRegex.exec(inputFilePath.base) : null;
        if (matches) {
            // we found a match, extract the metadata string (group 1) for updating
            updatedMetadataStr = matches[1];
            // and store the original so we can replace it in all file names
            originalMetadataStr = updatedMetadataStr;
        }
    }
    args.jobLog("original metadata string:{{ ".concat(updatedMetadataStr, " }}"));
    // if any video-based rename is enabled
    if (replaceVideoCodec || replaceVideoRes) {
        // first find the first video stream and get its media info
        var videoStream = streams === null || streams === void 0 ? void 0 : streams.filter(function (stream) { return (0, metadataUtils_1.getCodecType)(stream) === 'video'; })[0];
        // can't proceed if we can't find a stream to use
        if (videoStream) {
            var videoMediaInfo = (0, metadataUtils_1.getMediaInfoTrack)(videoStream, mediaInfo);
            // handle video codec replacement if enabled
            if (replaceVideoCodec) {
                updatedMetadataStr = updatedMetadataStr.replace(videoCodecRegex, (0, metadataUtils_1.getFileCodecName)(videoStream, videoMediaInfo));
            }
            // handle video resolution replacement if enabled
            if (replaceVideoRes) {
                updatedMetadataStr = updatedMetadataStr.replace(videoResRegex, (0, metadataUtils_1.getResolutionName)(videoStream));
            }
        }
    }
    if (replaceAudioCodec || replaceAudioChannels) {
        var audioStream = streams === null || streams === void 0 ? void 0 : streams.filter(function (stream) { return (0, metadataUtils_1.getCodecType)(stream) === 'audio'; })[0];
        // can't proceed if we can't find an audio stream to use
        if (audioStream) {
            var audioMediaInfo = (0, metadataUtils_1.getMediaInfoTrack)(audioStream, mediaInfo);
            // handle audio codec replacement if enabled
            if (replaceAudioCodec) {
                updatedMetadataStr = updatedMetadataStr.replace(audioCodecRegex, (0, metadataUtils_1.getFileCodecName)(audioStream, audioMediaInfo));
            }
            // handle audio channels replacement if enabled
            if (replaceAudioChannels) {
                updatedMetadataStr = updatedMetadataStr.replace(audioChannelsRegex, (0, metadataUtils_1.getChannelsName)(audioStream));
            }
        }
    }
    args.jobLog("new metadata string:{{ ".concat(updatedMetadataStr, " }}"));
    // default to the "no change" output path
    var outputNumber = 1;
    // check if we made any changes
    if (originalMetadataStr === updatedMetadataStr) {
        args.jobLog('no renaming required');
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: outputNumber,
            variables: args.variables,
        };
    }
    // build a list of other files to rename
    var toRename = [inputFilePath.base];
    args.jobLog("finding files in {{ ".concat(inputFileDir, " }} with name like {{ ").concat(inputFileName, " }}")
        + " and extensions ".concat(JSON.stringify(extensions)));
    // if enabled add other files in the directory
    if (renameOtherFiles) {
        fs_1.default.readdirSync(inputFileDir)
            .forEach(function (item) {
            var _a;
            // parse path for this item
            var filePath = path_1.default.parse("".concat(inputFileDir, "/").concat(item));
            // check if it's valid for rename
            if (((_a = filePath === null || filePath === void 0 ? void 0 : filePath.base) === null || _a === void 0 ? void 0 : _a.length) > 0 // valid file name
                && filePath.name.startsWith(inputFileName) // matches input file pattern
                && (extensions.length === 0 || extensions.includes(filePath.ext)) // passes extension filter
                && !toRename.includes(filePath.base) // not already in our list
            ) {
                toRename.push(filePath.base);
            }
        });
    }
    args.jobLog("will rename files: ".concat(JSON.stringify(toRename)));
    // store new primary file's path for output - default to input for dry run support
    var newPrimaryPath = args.inputFileObj._id;
    // iterate files
    toRename.forEach(function (fileName) {
        // replace original metadata string with our updated one
        var newName = fileName.replace(originalMetadataStr, updatedMetadataStr);
        // build old and new paths
        var oldPath = "".concat(inputFilePath.dir, "/").concat(fileName);
        var newPath = "".concat(inputFilePath.dir, "/").concat(newName);
        if (dryRun) {
            args.jobLog("would rename {{ ".concat(oldPath, " }} to {{ ").concat(newPath, " }}"));
        }
        else {
            args.jobLog("renaming - {{ ".concat(oldPath, " }} to {{ ").concat(newPath, " }}"));
            fs_1.default.renameSync(oldPath, newPath);
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
        outputNumber: outputNumber,
        variables: args.variables,
    };
};
exports.plugin = plugin;

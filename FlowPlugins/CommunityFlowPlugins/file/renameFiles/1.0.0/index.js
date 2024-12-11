"use strict";
/* eslint-disable max-len
   ----------------------
   some example file names and regexes are longer than the max
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var fileMoveOrCopy_1 = __importDefault(require("../../../../FlowHelpers/1.0.0/fileMoveOrCopy"));
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
            tooltip: "\n        Toggle whether to enable a regex for isolating the metadata portion of the file name to be replaced\n        \n\n\n        This can be useful if your file naming pattern allows for relatively easily isolating the portion to be renamed \n        with a regex and can help prevent accidental alterations to other parts of the file name.\n        ",
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
            tooltip: "\n        Enter a string which is used as a regex to locate the relevant portion of the file name that contains the video \n        and audio metadata to be updated. This can help prevent accidentally mutilating a file name that happens to \n        contain some bit of text that might match one of the pieces being replaced. Do not include the '/' delimiters \n        or the trailing flags. This will be converted to a proper RegExp via the constructor and always uses the 'gi' \n        flags for global/case-insensitive. \n        \n\n\n        For example, my standard naming scheme is:\n        \n\n\n        '{title stripped of special characters} - [{video_metadata}][{audio_metadata}]-release.mkv'\n        \n\n\n        'The Lord of the Rings The Return of the King (2003) - {edition-extended} [Hybrid][x264 Remux-1080p][TrueHD 6.1]-FraMeSToR.mkv'\n        \n\n\n        Mr. Robot (2015) S01E01 eps1.0_hellofriend.mov - [x265 AMZN WEBDL-1080p][EAC3 5.1]-Telly.mkv\n        \n\n\n        To best isolate the metadata I use the default regex above to isolate the portions with metadata in the \n        brackets and only replace data in that block. The same regex is then used to replace the old metadata block in \n        the file name(s) with the new one. \n        ",
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'One or more files were renamed',
        },
        {
            number: 2,
            tooltip: 'No files were renamed',
        },
    ],
}); };
exports.details = details;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, replaceVideoCodec, replaceVideoRes, replaceAudioCodec, replaceAudioChannels, renameOtherFiles, extensions, enableMetadataRegex, metadataRegexStr, metadataRegex, streams, mediaInfo, videoCodecRegex, videoResRegex, audioCodecRegex, audioChannelsRegex, inputFilePath, inputFileName, inputFileDir, files;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                replaceVideoCodec = Boolean(args.inputs.replaceVideoCodec);
                replaceVideoRes = Boolean(args.inputs.replaceVideoRes);
                replaceAudioCodec = Boolean(args.inputs.replaceAudioCodec);
                replaceAudioChannels = Boolean(args.inputs.replaceAudioChannels);
                renameOtherFiles = Boolean(args.inputs.renameOtherFiles);
                extensions = String(args.inputs.fileExtensions)
                    .split(',')
                    .map(function (item) { return item === null || item === void 0 ? void 0 : item.trim(); })
                    .filter(function (item) { return item && item.length > 0; })
                    .filter(function (item, index, items) { return items.indexOf(item) === index; });
                enableMetadataRegex = Boolean(args.inputs.enableMetadataRegex);
                metadataRegexStr = String(args.inputs.metadataRegex);
                metadataRegex = enableMetadataRegex ? RegExp(metadataRegexStr, 'gi') : null;
                streams = args.inputFileObj.ffProbeData.streams;
                mediaInfo = args.inputFileObj.mediaInfo;
                videoCodecRegex = /(h264|h265|x264|x265|avc|hevc|mpeg2|av1|vc1)/gi;
                videoResRegex = /(480p|576p|720p|1080p|1440p|2160p|4320p)/gi;
                audioCodecRegex = /(aac|ac3|eac3|flac|mp2|mp3|truehd|truehd atmos|dts[-. ]hd[-. ]ma|dts[-. ]hd[-. ]es|dts[-. ]hd[-. ]hra|dts[-. ]express|dts)/gi;
                audioChannelsRegex = /(1\.0|2\.0|2\.1|3\.0|3\.1|5\.1|6\.1|7\.1)/gi;
                inputFilePath = path_1.default.parse(args.inputFileObj._id);
                inputFileName = inputFilePath.name;
                inputFileDir = inputFilePath.dir;
                args.jobLog("finding files in [".concat(inputFileDir, "] with name like [").concat(inputFileName, "] and extensions ").concat(JSON.stringify(extensions)));
                files = [inputFilePath];
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
                            && !files.includes(filePath) // not already in our list
                        ) {
                            files.push(filePath);
                        }
                    });
                }
                // iterate files
                files.forEach(function (filePath) {
                    var newName = filePath.base;
                    // if using the metadata delimiter parse only the end of the file
                    if (enableMetadataRegex) {
                        args.jobLog("checking if file [".concat(filePath.base, "] matches regex [").concat(JSON.stringify(metadataRegex), "]"));
                        var matches = metadataRegex ? metadataRegex.exec(filePath.base) : null;
                        if (matches) {
                            args.jobLog("found match for regex: [".concat(newName, "] - ").concat(JSON.stringify(matches)));
                            matches.forEach(function (match, index) {
                                args.jobLog("group ".concat(index, " = ").concat(match));
                            });
                            newName = matches[1];
                        }
                        else {
                            args.jobLog("no match for regex in file [".concat(filePath.base, "]"));
                        }
                    }
                    // if any video-based rename is enabled
                    if (replaceVideoCodec || replaceVideoRes) {
                        // first find the first video stream and get its media info
                        var videoStream = streams === null || streams === void 0 ? void 0 : streams.filter(function (stream) { return (0, metadataUtils_1.getCodecType)(stream) === 'video'; })[0];
                        // can't proceed if we can't find a stream to use
                        if (videoStream) {
                            var videoMediaInfo = (0, metadataUtils_1.getMediaInfoTrack)(videoStream, mediaInfo);
                            // handle video codec replacement if enabled
                            if (replaceVideoCodec) {
                                newName = newName.replace(videoCodecRegex, (0, metadataUtils_1.getFileCodecName)(videoStream, videoMediaInfo));
                            }
                            // handle video resolution replacement if enabled
                            if (replaceVideoRes) {
                                newName = newName.replace(videoResRegex, (0, metadataUtils_1.getResolutionName)(videoStream));
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
                                newName = newName.replace(audioCodecRegex, (0, metadataUtils_1.getFileCodecName)(audioStream, audioMediaInfo));
                            }
                            // handle audio channels replacement if enabled
                            if (replaceAudioChannels) {
                                newName = newName.replace(audioChannelsRegex, (0, metadataUtils_1.getChannelsName)(audioStream));
                            }
                        }
                    }
                    // if using the metadata delimiter now replace the entire original suffix with the new one
                    if (enableMetadataRegex && metadataRegex) {
                        newName = filePath.base.replace(metadataRegex, newName);
                    }
                    args.jobLog("renaming [".concat(filePath.base, "] to [").concat(newName, "]"));
                    // ToDo - actually rename
                });
                if (!(inputFileName === 'aaaa')) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, fileMoveOrCopy_1.default)({
                        operation: 'move',
                        sourcePath: args.inputFileObj._id,
                        destinationPath: args.inputFileObj._id,
                        args: args,
                    })];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2: return [2 /*return*/, {
                    outputFileObj: args.inputFileObj,
                    outputNumber: 1,
                    variables: args.variables,
                }];
        }
    });
}); };
exports.plugin = plugin;

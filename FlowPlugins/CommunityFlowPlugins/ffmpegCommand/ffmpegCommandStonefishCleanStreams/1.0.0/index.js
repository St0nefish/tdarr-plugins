"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
var metadataUtils_1 = require("../../../../FlowHelpers/1.0.0/metadataUtils");
var IFileObject_1 = require("../../../../FlowHelpers/1.0.0/interfaces/synced/IFileObject");
/* eslint-disable no-param-reassign */
var details = function () { return ({
    name: 'Cleanup Streams',
    description: "\n    Remove unwanted streams. \n    \n\n\n    This plugin will iterate through all streams that are present and remove ones which are detected as unwanted after\n    applying the various configuration options below. \n    \n\n\n    I use this to purge anything not in my native language, remove duplicates if present, remove data & image streams,\n    and anything flagged as descriptive. There are additional options to remove commentary as well. \n    ",
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
            label: 'Remove Unwanted Video',
            name: 'removeVideo',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n         Toggle whether to remove video streams. \n         \n\n\n         This will remove streams which are flagged as an unwanted language. \n         \n\n\n         If doing so would remove all present video streams then the plugin will fail.\n         ",
        },
        {
            label: 'Remove Unwanted Audio',
            name: 'removeAudio',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n        Toggle whether to remove audio streams. \n        \n\n\n        This will remove a stream if the it is an unwanted language, a duplicate combo of language+channels, or flagged \n        as unwanted commentary or descriptions. \n        \n\n\n        If the configured criteria would cause this plugin to remove all present audio streams then it will fail. \n        ",
        },
        {
            label: 'Remove Unwanted Subtitles',
            name: 'removeSubtitles',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n        Toggle whether to remove subtitle streams. \n        \n\n\n        This will remove a stream if it is an unwanted language, is a duplicate combo of language+default+forced, or is \n        flagged as unwanted commentary or descriptions. \n        \n\n\n        This will *not* fail if it is going to remove all present subtitle streams. Unlike video and audio I consider \n        the subtitles to be nice-to-have and often manage them as external srt files anyway. \n        ",
        },
        {
            label: 'Languages to Keep',
            name: 'keepLanguages',
            type: 'string',
            defaultValue: 'eng',
            inputUI: {
                type: 'text',
                displayConditions: {
                    logic: 'OR',
                    sets: [
                        {
                            logic: 'OR',
                            inputs: [
                                {
                                    name: 'removeVideo',
                                    value: 'true',
                                    condition: '===',
                                },
                                {
                                    name: 'removeAudio',
                                    value: 'true',
                                    condition: '===',
                                },
                                {
                                    name: 'removeSubtitles',
                                    value: 'true',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: "\n        Enter a comma-separated list of language tags to keep. \n        \n\n\n        This will only apply to stream types with their remove flags enabled. \n        \n\n\n        Any video, audio, or subtitle stream tagged as a language not in this list will be flagged for removal. \n        \n\n\n        Any stream without a language tag present will be treated as matching the first entry in this list. \n        ",
        },
        {
            label: 'Remove Duplicates',
            name: 'removeDuplicates',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
                displayConditions: {
                    logic: 'OR',
                    sets: [
                        {
                            logic: 'OR',
                            inputs: [
                                {
                                    name: 'removeVideo',
                                    value: 'true',
                                    condition: '===',
                                },
                                {
                                    name: 'removeAudio',
                                    value: 'true',
                                    condition: '===',
                                },
                                {
                                    name: 'removeSubtitles',
                                    value: 'true',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: "\n        Toggle whether to remove streams which appear to be duplicates of others. \n        \n\n\n        For video streams it will keep the highest resolution+bitrate grouped by language. \n        \n\n\n        For audio it will keep the one with the highest bitrate grouped by language+channels+commentary+descriptive. \n        \n\n\n        For subtitles it will keep the first entry grouped by language+default+forced flags. \n        \n\n\n        All streams which appear to be commentary will be kept if the relevant \"Remove Commentary\" setting is disabled. \n        ",
        },
        {
            label: 'Remove Other Streams',
            name: 'removeOther',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Toggle whether to remove streams that are not video, audio, or subtitle',
        },
        {
            label: 'Remove Audio Commentary',
            name: 'removeCommentaryAudio',
            type: 'boolean',
            defaultValue: 'false',
            inputUI: {
                type: 'switch',
                displayConditions: {
                    logic: 'AND',
                    sets: [
                        {
                            logic: 'AND',
                            inputs: [
                                {
                                    name: 'removeAudio',
                                    value: 'true',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: "\n        Toggle whether to remove audio streams tagged as commentary. \n        \n\n\n        This is detected by checking if the 'comment' disposition flag is set or if the title contains 'commentary' \n        (case insensitive). \n        ",
        },
        {
            label: 'Remove Audio Descriptions',
            name: 'removeDescriptiveAudio',
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
                                    name: 'removeAudio',
                                    value: 'true',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: "\n        Toggle whether to remove audio streams tagged as descriptive. \n        \n\n\n        This is detected by checking if the 'descriptions' disposition flag is set or if the title contains \n        'description', 'descriptive', or 'sdh' (case insensitive). \n        ",
        },
        {
            label: 'Remove Subtitle Commentary',
            name: 'removeCommentarySubs',
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
                                    name: 'removeSubtitles',
                                    value: 'true',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: "\n        Toggle whether to remove subtitle streams tagged as commentary. \n        \n\n\n        This is detected by checking if the 'comment' disposition flag is set or if the title contains 'commentary' \n        (case insensitive). \n        ",
        },
        {
            label: 'Remove Subtitle Descriptions',
            name: 'removeDescriptiveSubs',
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
                                    name: 'removeAudio',
                                    value: 'true',
                                    condition: '===',
                                },
                            ],
                        },
                    ],
                },
            },
            tooltip: "\n        Toggle whether to remove subtitle streams tagged as descriptive. \n        \n\n\n        This is detected by checking if the 'descriptions' disposition flag is set or if the title contains \n        'description', 'descriptive', or 'sdh' (case insensitive). \n        ",
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'Continue to next plugin',
        },
    ],
}); };
exports.details = details;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, removeVideo, removeAudio, removeSubs, removeOther, removeDuplicates, removeCommentaryAudio, removeCommentarySubs, removeDescriptiveAudio, removeDescriptiveSubs, keepLanguages, defaultLanguage, streams, mediaInfo, inputStreamCounts, streamRemovedMap, countRemoved, getDedupeGroupKey, getSortInfo, dedupeMap, addToDedupeMap;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                // ensure ffmpeg command has been initialized
                (0, flowUtils_1.checkFfmpegCommandInit)(args);
                removeVideo = Boolean(args.inputs.removeVideo);
                removeAudio = Boolean(args.inputs.removeAudio);
                removeSubs = Boolean(args.inputs.removeSubtitles);
                removeOther = Boolean(args.inputs.removeOther);
                removeDuplicates = Boolean(args.inputs.removeDuplicates);
                removeCommentaryAudio = Boolean(args.inputs.removeCommentaryAudio);
                removeCommentarySubs = Boolean(args.inputs.removeCommentarySubs);
                removeDescriptiveAudio = Boolean(args.inputs.removeDescriptiveAudio);
                removeDescriptiveSubs = Boolean(args.inputs.removeDescriptiveSubs);
                keepLanguages = String(args.inputs.keepLanguages)
                    .split(',')
                    .filter(function (langTag) { return langTag; })
                    .map(function (langTag) { return langTag.trim(); });
                defaultLanguage = (_a = keepLanguages[0]) !== null && _a !== void 0 ? _a : 'eng';
                streams = args.variables.ffmpegCommand.streams;
                (0, metadataUtils_1.setTypeIndexes)(streams);
                return [4 /*yield*/, (0, metadataUtils_1.getMediaInfo)(args)];
            case 1:
                mediaInfo = _b.sent();
                inputStreamCounts = (0, metadataUtils_1.getTypeCountsMap)(streams);
                args.jobLog("input stream counts: ".concat(JSON.stringify(inputStreamCounts)));
                streamRemovedMap = {};
                countRemoved = function (stream) {
                    var _a;
                    var codecType = (0, metadataUtils_1.getCodecType)(stream);
                    streamRemovedMap[codecType] = ((_a = streamRemovedMap[codecType]) !== null && _a !== void 0 ? _a : 0) + 1;
                };
                getDedupeGroupKey = function (stream) {
                    // build array of group-by keys - always start with codec type
                    var groupBy = [(0, metadataUtils_1.getCodecType)(stream)];
                    if ((0, metadataUtils_1.isVideo)(stream)) {
                        groupBy.push((0, metadataUtils_1.getLanguageTag)(stream, defaultLanguage));
                    }
                    else if ((0, metadataUtils_1.isAudio)(stream)) {
                        // audio always groups by language
                        groupBy.push((0, metadataUtils_1.getLanguageTag)(stream, defaultLanguage));
                        if ((0, metadataUtils_1.isStandardStream)(stream)) {
                            // standard streams also group by channels
                            groupBy.push((0, metadataUtils_1.getChannelsName)(stream));
                        }
                        else {
                            // commentary & descriptive streams also group by title
                            groupBy.push("[".concat((0, metadataUtils_1.getOrGenerateTitle)(stream), "]"));
                        }
                    }
                    else if ((0, metadataUtils_1.isSubtitle)(stream)) {
                        // subs always group by language
                        groupBy.push((0, metadataUtils_1.getLanguageTag)(stream, defaultLanguage));
                        if ((0, metadataUtils_1.isStandardStream)(stream)) {
                            // standard streams subgroup by the default + forced flags
                            groupBy.push(stream.disposition.default ? 'default' : undefined);
                            groupBy.push(stream.disposition.forced ? 'forced' : undefined);
                        }
                        else {
                            // commentary/descriptive streams subgroup by flags and title
                            groupBy.push((0, metadataUtils_1.isCommentaryStream)(stream) ? 'commentary' : undefined);
                            groupBy.push((0, metadataUtils_1.isDescriptiveStream)(stream) ? 'descriptive' : undefined);
                            groupBy.push("[".concat((0, metadataUtils_1.getOrGenerateTitle)(stream), "]"));
                        }
                    }
                    else {
                        // all other types subgroup by type index
                        groupBy.push("typeIndex=".concat(stream.typeIndex));
                    }
                    // filter out any undefined keys and join with ':' to build group by key
                    return groupBy.filter(function (item) { return item; }).join(':');
                };
                getSortInfo = function (stream) {
                    if ((0, metadataUtils_1.isVideo)(stream)) {
                        return "".concat((0, metadataUtils_1.getResolutionName)(stream), " ").concat((0, metadataUtils_1.getBitrateText)(stream, (0, metadataUtils_1.getMediaInfoTrack)(stream, mediaInfo)));
                    }
                    if ((0, metadataUtils_1.isAudio)(stream)) {
                        return "".concat((0, metadataUtils_1.getBitrateText)(stream));
                    }
                    if ((0, metadataUtils_1.isSubtitle)(stream)) {
                        return "index:".concat(stream.typeIndex);
                    }
                    return '';
                };
                dedupeMap = {
                    video: {},
                    audio: {},
                    subtitle: {},
                };
                addToDedupeMap = function (stream) {
                    var _a, _b;
                    var _c, _d;
                    var codecType = (0, metadataUtils_1.getCodecType)(stream);
                    (_a = dedupeMap[codecType]) !== null && _a !== void 0 ? _a : (dedupeMap[codecType] = {});
                    (_b = (_c = dedupeMap[codecType])[_d = getDedupeGroupKey(stream)]) !== null && _b !== void 0 ? _b : (_c[_d] = []);
                    dedupeMap[codecType][getDedupeGroupKey(stream)].push(stream);
                };
                // iterate streams to flag the ones to remove
                args.variables.ffmpegCommand.streams.forEach(function (stream) {
                    var _a, _b, _c, _d;
                    var codecType = (0, metadataUtils_1.getCodecType)(stream);
                    switch (codecType) {
                        case IFileObject_1.StreamType.video:
                            if (removeVideo) {
                                if (!(0, metadataUtils_1.streamMatchesLanguages)(stream, keepLanguages, defaultLanguage)) {
                                    // language is unwanted
                                    stream.removed = true;
                                    stream.removeReason = "language [".concat((_a = stream.tags) === null || _a === void 0 ? void 0 : _a.language, "] is unwanted");
                                }
                            }
                            break;
                        case IFileObject_1.StreamType.audio:
                            // determine if we should remove this audio stream
                            if (removeAudio) {
                                // audio cleanup is enabled
                                if (!(0, metadataUtils_1.streamMatchesLanguages)(stream, keepLanguages, defaultLanguage)) {
                                    // language is unwanted
                                    stream.removed = true;
                                    stream.removeReason = "language [".concat((_b = stream.tags) === null || _b === void 0 ? void 0 : _b.language, "] is unwanted");
                                }
                                else if (removeCommentaryAudio && (0, metadataUtils_1.isCommentaryStream)(stream)) {
                                    // unwanted commentary
                                    stream.removed = true;
                                    stream.removeReason = 'detected as unwanted commentary';
                                }
                                else if (removeDescriptiveAudio && (0, metadataUtils_1.isDescriptiveStream)(stream)) {
                                    // unwanted descriptive
                                    stream.removed = true;
                                    stream.removeReason = 'detected as unwanted description';
                                }
                            }
                            break;
                        case IFileObject_1.StreamType.subtitle:
                            if (removeSubs) {
                                // subtitle cleanup is enabled
                                if (!(0, metadataUtils_1.streamMatchesLanguages)(stream, keepLanguages, defaultLanguage)) {
                                    // language is unwanted
                                    stream.removed = true;
                                    stream.removeReason = "language [".concat((_c = stream.tags) === null || _c === void 0 ? void 0 : _c.language, "] is unwanted");
                                }
                                else if (removeCommentarySubs && (0, metadataUtils_1.isCommentaryStream)(stream)) {
                                    // unwanted commentary
                                    stream.removed = true;
                                    stream.removeReason = 'detected as unwanted commentary';
                                }
                                else if (removeDescriptiveSubs && (0, metadataUtils_1.isDescriptiveStream)(stream)) {
                                    // unwanted descriptive
                                    stream.removed = true;
                                    stream.removeReason = 'detected as unwanted description';
                                }
                            }
                            break;
                        default:
                            // if not video, audio, or subtitle
                            if (removeOther) {
                                // unwanted stream type
                                stream.removed = true;
                                stream.removeReason = "stream type [".concat(codecType, "] is unwanted");
                            }
                    }
                    // handle counting and de-dupe map
                    if (stream.removed) {
                        countRemoved(stream);
                        args.jobLog("removing [".concat(codecType, "] stream [s:").concat(stream.index, ":a:").concat(stream.typeIndex, "] ")
                            + "[".concat((0, metadataUtils_1.getOrGenerateTitle)(stream, (_d = mediaInfo === null || mediaInfo === void 0 ? void 0 : mediaInfo.track) === null || _d === void 0 ? void 0 : _d[stream.index]), "] - ").concat(stream.removeReason));
                    }
                    else {
                        // add to map for subsequent de-duplication
                        addToDedupeMap(stream);
                    }
                });
                // handle de-duplication if enabled
                if (removeDuplicates) {
                    // iterate codec types in duplicate-tracking map
                    Object.keys(dedupeMap)
                        .forEach(function (codecType) {
                        // for each codec type
                        Object.keys(dedupeMap[codecType])
                            .forEach(function (groupByKey) {
                            var groupedStreams = dedupeMap[codecType][groupByKey];
                            if (groupedStreams.length > 1) {
                                groupedStreams.sort((0, metadataUtils_1.getStreamSorter)(mediaInfo))
                                    .forEach(function (stream, index) {
                                    var _a;
                                    // keep the first entry, discard the rest
                                    if (index > 0) {
                                        args.jobLog("removing [".concat(codecType, "] stream [s:").concat(stream.index, ":a:").concat(stream.typeIndex, "] ")
                                            + "[".concat((0, metadataUtils_1.getOrGenerateTitle)(stream, (_a = mediaInfo === null || mediaInfo === void 0 ? void 0 : mediaInfo.track) === null || _a === void 0 ? void 0 : _a[stream.index]), "] - stream is not best option ")
                                            + "for group-by-key:[".concat(groupByKey, "] and sort info:[").concat(getSortInfo(stream), "]"));
                                        stream.removed = true;
                                        countRemoved(stream);
                                    }
                                });
                            }
                        });
                    });
                }
                // log removal summary
                args.jobLog("attempting to remove streams: ".concat(JSON.stringify(streamRemovedMap)));
                // safety check to avoid removing all video streams
                if (streamRemovedMap.video >= (inputStreamCounts.video || 0)) {
                    // trying to remove all audio streams
                    throw new Error("Error: attempting to remove all ".concat(inputStreamCounts.video, " video streams"));
                }
                // safety check to avoid removing all audio streams
                if (streamRemovedMap.audio >= (inputStreamCounts.audio || 0)) {
                    // trying to remove all audio streams
                    throw new Error("Error: attempting to remove all ".concat(inputStreamCounts.audio, " audio streams"));
                }
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: 1,
                        variables: args.variables,
                    }];
        }
    });
}); };
exports.plugin = plugin;

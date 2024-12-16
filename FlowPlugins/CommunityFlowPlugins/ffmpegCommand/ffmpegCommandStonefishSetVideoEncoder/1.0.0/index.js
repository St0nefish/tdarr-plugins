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
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var hardwareUtils_1 = require("../../../../FlowHelpers/1.0.0/hardwareUtils");
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
var metadataUtils_1 = require("../../../../FlowHelpers/1.0.0/metadataUtils");
var fileUtils_1 = require("../../../../FlowHelpers/1.0.0/fileUtils");
/* eslint-disable no-param-reassign */
var details = function () { return ({
    name: 'Set Video Encoder (stonefish)',
    description: "\n     Configure the video encoder settings \n     \n\n\n     See the following resources for more details on what these settings do:\n     \n\n\n     - https://trac.ffmpeg.org/wiki/Encode/H.264\n     \n\n\n     - https://trac.ffmpeg.org/wiki/Encode/H.265\n     \n\n\n     - https://trac.ffmpeg.org/wiki/Encode/AV1\n     \n\n\n     Credit to the default ffmpegCommandSetVideoEncoder plugin. I forked it to add options to control the title \n     behavior and change default values to match my personal preference.\n     ",
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
            tooltip: "\n        Specify how to handle the title of the resulting stream\n        \n\n\n        - default : defer to the default ffmpeg behavior\n        \n\n\n        - clear : clear the title value\n        \n\n\n        - generate : generate a title from {codec}\n        ",
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
// function to get vf options by resolution - defaults to 1080p
var getVfScaleArgs = function (targetResolution) {
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
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, outputContainer, outputResolution, outputCodec, hardwareDecoding, ffmpegPresetEnabled, ffmpegQualityEnabled, ffmpegPreset, ffmpegQuality, forceEncoding, hardwareEncoding, hardwareType, titleMode, encoderProperties, container;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                // ensure ffmpeg command was initiated
                (0, flowUtils_1.checkFfmpegCommandInit)(args);
                outputContainer = String(args.inputs.outputContainer);
                outputResolution = String(args.inputs.outputResolution);
                outputCodec = String(args.inputs.outputCodec);
                hardwareDecoding = Boolean(args.inputs.hardwareDecoding);
                ffmpegPresetEnabled = Boolean(args.inputs.ffmpegPresetEnabled);
                ffmpegQualityEnabled = Boolean(args.inputs.ffmpegQualityEnabled);
                ffmpegPreset = String(args.inputs.ffmpegPreset);
                ffmpegQuality = String(args.inputs.ffmpegQuality);
                forceEncoding = Boolean(args.inputs.forceEncoding);
                hardwareEncoding = Boolean(args.inputs.hardwareEncoding);
                hardwareType = String(args.inputs.hardwareType);
                titleMode = String(args.inputs.titleMode);
                return [4 /*yield*/, (0, hardwareUtils_1.getEncoder)({
                        targetCodec: outputCodec,
                        hardwareEncoding: hardwareEncoding,
                        hardwareType: hardwareType,
                        args: args,
                    })];
            case 1:
                encoderProperties = _a.sent();
                // first handle container if not already correct
                if ((0, fileUtils_1.getContainer)(args.inputFileObj._id) !== outputContainer) {
                    args.variables.ffmpegCommand.shouldProcess = true;
                    args.variables.ffmpegCommand.container = outputContainer;
                    container = args.inputFileObj.container.toLowerCase();
                    if (['ts', 'avi', 'mpg', 'mpeg'].includes(container)) {
                        args.variables.ffmpegCommand.overallOuputArguments.push('-fflags', '+genpts');
                    }
                }
                // iterate streams, filter to video, and configure encoding options
                args.variables.ffmpegCommand.streams.filter(metadataUtils_1.isVideo).forEach(function (stream) {
                    var _a, _b, _c;
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
                            (_a = stream.outputArgs).push.apply(_a, getVfScaleArgs(outputResolution));
                        }
                        // handle configured quality settings
                        if (ffmpegQualityEnabled) {
                            if (encoderProperties.isGpu) {
                                stream.outputArgs.push('-qp', ffmpegQuality);
                            }
                            else {
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
                            (_b = stream.inputArgs).push.apply(_b, encoderProperties.inputArgs);
                        }
                        // push remaining encoder output args
                        if (encoderProperties.outputArgs) {
                            (_c = stream.outputArgs).push.apply(_c, encoderProperties.outputArgs);
                        }
                        // handle title removal or generation
                        if (titleMode === 'clear') {
                            stream.outputArgs.push('-metadata:s:v:{outputTypeIndex}', 'title=');
                        }
                        else if (titleMode === 'generate') {
                            stream.outputArgs.push('-metadata:s:v:{outputTypeIndex}', "title=".concat(outputCodec));
                        }
                    }
                });
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: 1,
                        variables: args.variables,
                    }];
        }
    });
}); };
exports.plugin = plugin;

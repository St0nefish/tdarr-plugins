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
var letterboxUtils_1 = require("../../../../FlowHelpers/1.0.0/letterboxUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Stonefish Check Letterboxing',
    description: "\n    Check if the input video is letterboxed. \n    \n\n\n    The various options allow control over how this region is detected. Detection is done using HandBrake's \n    `--crop-mode --scan` options. This works by extracting a number of sample images then scanning those to detect \n    the black bars around the outside. The number of sample images will be calculated by determining the duration of \n    video scanned after accounting for start and end offsets and dividing that time by the configured \"Seconds per \n    Preview\" setting. The 'Minimum Crop Percentage' setting is used to avoid attempting to crop a video if the \n    calculated crop settings are below that threshold. For example, if left at the default 2%, then for a 1080p video \n    this plugin will only specify that letterboxing is detected if the HandBrake scan determines that at least 22 \n    pixels would be removed from the height. \n    \n\n\n    Note 1: This only works properly for files containing a single video stream, this seems to be a limitation of \n    HandBrake. \n    \n\n\n    Note 2: Hardware decoding is a work-in-progress, I have only tested and confirmed it to be working on NVIDIA GPUs, \n    but it *does* make a noticeable difference when enabled. My very basic testing shows enabling it to about half the \n    total execution time compared to a CPU-only scan. \n    ",
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
            tooltip: "\n        Specify hardware encoder to use. Auto mode really just detects nvidia right now and enables nvdec, and \n        potentially qsv if the decoder shares the same name. I'm struggling to find available input options to populate\n        this.\n        ",
        },
        {
            label: 'Store Results to Flow Variables',
            name: 'storeCropSettings',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: "\n        Specify whether to store the crop detection results to user variables for use by subsequent plugins. This will \n        be stored as a JSON version of the CropInfo object from the letterboxUtils file on the \n        `args.variables.user.crop_object` variable (used by the Stonefish Set Video Encoder plugin), and in the form \n        of ffmpeg (width:height:x:y) and HandBrake (top/bottom/left/right) crop arguments, which can be used by \n        referencing the `args.variables.user.crop_ffmpeg` or `args.variables.user.crop_handbrake` variables. This \n        can allow for a slight performance optimization if there is a need to control the flow based on the letterbox \n        state and subsequently remove that letterboxing without re-running the scan. \n        ",
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
}); };
exports.details = details;
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, scanConfig, cropInfo, outputNumber;
    var _a, _b;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                scanConfig = {
                    cropMode: String(args.inputs.cropMode),
                    secondsPerPreview: Number(args.inputs.secondsPerPreview),
                    startOffsetPct: Number(args.inputs.startOffsetPct),
                    endOffsetPct: Number(args.inputs.endOffsetPct),
                    enableHwDecoding: Boolean(args.inputs.enableHwDecoding),
                    hwDecoder: String(args.inputs.hwDecoder),
                };
                return [4 /*yield*/, letterboxUtils_1.CropInfo.fromHandBrakeScan(args, args.inputFileObj, scanConfig)];
            case 1:
                cropInfo = _d.sent();
                args.jobLog("calculated crop info: ".concat(JSON.stringify(cropInfo)));
                args.jobLog("would use ffmpeg crop: [".concat(cropInfo.getFfmpegCropString(), "]"));
                args.jobLog("would use handbrake crop: [".concat(cropInfo.getHandBrakeCropString(), "]"));
                // store result if specified
                if (args.inputs.storeCropSettings) {
                    // ensure user variable object exists
                    // eslint-disable-next-line no-param-reassign
                    (_a = (_c = args.variables).user) !== null && _a !== void 0 ? _a : (_c.user = {});
                    // then set our crop info details
                    // eslint-disable-next-line no-param-reassign
                    args.variables.user.crop_object = JSON.stringify(cropInfo);
                    // eslint-disable-next-line no-param-reassign
                    args.variables.user.crop_ffmpeg = cropInfo.getFfmpegCropString();
                    // eslint-disable-next-line no-param-reassign
                    args.variables.user.crop_handbrake = cropInfo.getHandBrakeCropString();
                }
                outputNumber = cropInfo.shouldCrop(Number((_b = args.inputs.minCropPct) !== null && _b !== void 0 ? _b : 0)) ? 1 : 2;
                // return
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: outputNumber,
                        variables: args.variables,
                    }];
        }
    });
}); };
exports.plugin = plugin;

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
    name: 'Check Letterboxing',
    description: "\n    Check if video is letterboxed. Options below allow control over how this region is detected, mostly to allow for \n    configuring a balance between the cost of the calculation and the accuracy. By default it tries to be conservative, \n    only treating it as letterbox if quite noticeably so, and averaging multiple samples to calculate the active frame \n    area. \n    ",
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
            label: 'Detection Method',
            name: 'detectMethod',
            type: 'string',
            defaultValue: 'mvedges',
            inputUI: {
                type: 'dropdown',
                options: [
                    'mvedges',
                    'black_borders',
                ],
            },
            tooltip: "\n        Specify the ffmpeg method to use to detect if the video is letterboxed. \n        \n\n\n        \n\n\n        mvedges - generate motion vectors and use those to detect the active region. \n        \n\n\n        black_borders - detect the regions that are solid black. \n        \n\n\n        \n\n\n        While testing this I found 'mvedges' to be slower, but more consistent. \n        ",
        },
        {
            label: 'Sample Length',
            name: 'sampleLength',
            type: 'number',
            defaultValue: '60',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Specify the length (in seconds) of each sample to take when running the ffmpeg scans.',
        },
        {
            label: 'Sample Count',
            name: 'sampleCount',
            type: 'number',
            defaultValue: '5',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Specify the number of randomly-distributed samples to take',
        },
        {
            label: 'Start Offset',
            name: 'startOffset',
            type: 'number',
            defaultValue: '300',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Offset (in seconds) from the beginning of the video to avoid scanning the intro.',
        },
        {
            label: 'End Offset',
            name: 'endOffset',
            type: 'number',
            defaultValue: '300',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Offset (in seconds) from the end of the video to avoid scanning the outro.',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'File is HDR',
        },
        {
            number: 2,
            tooltip: 'File is not HDR',
        },
    ],
}); };
exports.details = details;
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, cropValues, cropValueFrequency;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                return [4 /*yield*/, (0, letterboxUtils_1.getCropInfo)(args)];
            case 1:
                cropValues = _a.sent();
                cropValueFrequency = {};
                cropValues.forEach(function (value) {
                    var _a;
                    cropValueFrequency[value.toString()] = ((_a = cropValueFrequency[value.toString()]) !== null && _a !== void 0 ? _a : 0) + 1;
                });
                // logs
                args.jobLog('<========== scan complete ==========>');
                args.jobLog("frequencies: ".concat(JSON.stringify(cropValueFrequency)));
                args.jobLog('<========== raw crop data ==========>');
                cropValues.forEach(function (detail, index) {
                    args.jobLog("[".concat(index, "] - ").concat(detail.toString()));
                });
                args.jobLog('<========== logs complete ==========>');
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: 1,
                        variables: args.variables,
                    }];
        }
    });
}); };
exports.plugin = plugin;

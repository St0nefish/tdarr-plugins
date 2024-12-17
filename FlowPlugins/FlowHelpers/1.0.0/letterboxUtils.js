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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCropInfo = exports.sleep = exports.getCropInfoString = exports.getCropInfoFromString = void 0;
var cliUtils_1 = require("./cliUtils");
var metadataUtils_1 = require("./metadataUtils");
var getCropInfoFromString = function (cropInfoStr) {
    var _a, _b, _c, _d;
    var split = String(cropInfoStr).split(':');
    return {
        w: Number((_a = split[0]) !== null && _a !== void 0 ? _a : 0),
        h: Number((_b = split[1]) !== null && _b !== void 0 ? _b : 0),
        x: Number((_c = split[2]) !== null && _c !== void 0 ? _c : 0),
        y: Number((_d = split[3]) !== null && _d !== void 0 ? _d : 0),
    };
};
exports.getCropInfoFromString = getCropInfoFromString;
// get the crop info string
var getCropInfoString = function (cropInfo) { return ("".concat(cropInfo.w, ":").concat(cropInfo.h, ":").concat(cropInfo.x, ":").concat(cropInfo.y)); };
exports.getCropInfoString = getCropInfoString;
// eslint-disable-next-line require-await
var sleep = function (ms) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, ms); })];
}); }); };
exports.sleep = sleep;
// function to get crop info from a video file
// present as 'inputFileObj' on the args object
var getCropInfo = function (args_1, file_1) {
    var args_2 = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args_2[_i - 2] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([args_1, file_1], args_2, true), void 0, function (args, file, startOffsetPct, endOffsetPct, numSamples, relevantPct) {
        var os, totalDuration, startTime, endTime, scannedTime, fps, spawnArgs, response, cropValues, cropValueFrequency, cropWidthFrequency, cropXOffsetFrequency, cropHeightFrequency, cropYOffsetFrequency, numValues, returnInfo, videoStream, inputWidth, outputWidth_1, outputX_1, xOffsetCount_1, inputHeight, outputHeight_1, outputY_1, yOffsetCount_1;
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (startOffsetPct === void 0) { startOffsetPct = 5; }
        if (endOffsetPct === void 0) { endOffsetPct = 5; }
        if (numSamples === void 0) { numSamples = 250; }
        if (relevantPct === void 0) { relevantPct = 5; }
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    os = require('os');
                    totalDuration = Math.round(Number((_b = (_a = file.ffProbeData.format) === null || _a === void 0 ? void 0 : _a.duration) !== null && _b !== void 0 ? _b : 0));
                    startTime = Math.round((startOffsetPct / 100) * totalDuration);
                    endTime = Math.round(((100 - endOffsetPct) / 100) * totalDuration);
                    scannedTime = endTime - startTime;
                    fps = numSamples / scannedTime;
                    // log some details
                    args.jobLog("will scan [".concat(scannedTime, "/").concat(totalDuration, "]s. start time:").concat(startTime, "s, end time:").concat(endTime, "s, ")
                        + "framerate:".concat(fps, "fps"));
                    spawnArgs = [];
                    // always hide banner and stats
                    spawnArgs.push('-hide_banner', '-nostats');
                    // set start offset
                    spawnArgs.push('-ss', "".concat(startTime));
                    // set sample length
                    spawnArgs.push('-to', "".concat(endTime));
                    // set input file
                    spawnArgs.push('-i', file._id);
                    // set cropdetect settings
                    spawnArgs.push('-vf', "fps=fps=".concat(fps, ",mestimate,cropdetect=mode=mvedges,metadata=mode=print"));
                    // no output file
                    spawnArgs.push('-f', 'null', '-');
                    return [4 /*yield*/, (new cliUtils_1.CLI({
                            cli: args.ffmpegPath,
                            spawnArgs: spawnArgs,
                            spawnOpts: {},
                            jobLog: args.jobLog,
                            outputFilePath: file._id,
                            inputFileObj: file,
                            logFullCliOutput: true, // require full logs to ensure access to all cropdetect data
                            updateWorker: args.updateWorker,
                            args: args,
                        })).runCli()];
                case 1:
                    response = _j.sent();
                    // logs
                    return [4 /*yield*/, (0, exports.sleep)(100)];
                case 2:
                    // logs
                    _j.sent();
                    args.jobLog('<========== cropdata scan complete ==========>');
                    return [4 /*yield*/, (0, exports.sleep)(100)];
                case 3:
                    _j.sent();
                    args.jobLog("parsing [".concat(response.errorLogFull.length, "] total lines of log data"));
                    cropValues = response.errorLogFull
                        .filter(function (line) { return line.startsWith('[Parsed_cropdetect_'); })
                        .map(function (line) { return line.split(os.EOL)[0]; })
                        .map(function (line) { return line.split('crop=').pop(); })
                        .map(function (line) { return (0, exports.getCropInfoFromString)(String(line)); });
                    // determine number of samples we're working with
                    args.jobLog("parsing [".concat(cropValues.length, "] lines containing cropdetect data"));
                    cropValueFrequency = new Map();
                    cropWidthFrequency = new Map();
                    cropXOffsetFrequency = new Map();
                    cropHeightFrequency = new Map();
                    cropYOffsetFrequency = new Map();
                    // iterate to parse
                    cropValues.forEach(function (cropInfo) {
                        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                        var cropInfoString = (0, exports.getCropInfoString)(cropInfo);
                        cropValueFrequency.set(cropInfoString, ((_a = cropValueFrequency.get(cropInfoString)) !== null && _a !== void 0 ? _a : 0) + 1);
                        // track width and x-offset frequencies
                        cropWidthFrequency.set(cropInfo.w, ((_b = cropWidthFrequency.get(cropInfo.w)) !== null && _b !== void 0 ? _b : 0) + 1);
                        if (!cropXOffsetFrequency.get(cropInfo.w))
                            cropXOffsetFrequency.set(cropInfo.w, new Map());
                        (_c = cropXOffsetFrequency.get(cropInfo.w)) === null || _c === void 0 ? void 0 : _c.set(cropInfo.x, ((_e = (_d = cropXOffsetFrequency.get(cropInfo.w)) === null || _d === void 0 ? void 0 : _d.get(cropInfo.x)) !== null && _e !== void 0 ? _e : 0) + 1);
                        // track height and y-offset frequencies
                        cropHeightFrequency.set(cropInfo.h, ((_f = cropHeightFrequency.get(cropInfo.h)) !== null && _f !== void 0 ? _f : 0) + 1);
                        if (!cropYOffsetFrequency.get(cropInfo.h))
                            cropYOffsetFrequency.set(cropInfo.h, new Map());
                        (_g = cropYOffsetFrequency.get(cropInfo.h)) === null || _g === void 0 ? void 0 : _g.set(cropInfo.y, ((_j = (_h = cropYOffsetFrequency.get(cropInfo.h)) === null || _h === void 0 ? void 0 : _h.get(cropInfo.y)) !== null && _j !== void 0 ? _j : 0) + 1);
                    });
                    // frequency logs
                    return [4 /*yield*/, (0, exports.sleep)(100)];
                case 4:
                    // frequency logs
                    _j.sent();
                    args.jobLog('<============ frequency data ============>');
                    return [4 /*yield*/, (0, exports.sleep)(100)];
                case 5:
                    _j.sent();
                    args.jobLog("detected crop info frequencies: ".concat(JSON.stringify(cropValueFrequency)));
                    return [4 /*yield*/, (0, exports.sleep)(100)];
                case 6:
                    _j.sent();
                    args.jobLog('<============ frequency data ============>');
                    return [4 /*yield*/, (0, exports.sleep)(100)];
                case 7:
                    _j.sent();
                    numValues = cropValueFrequency.size;
                    if (numValues > 1) {
                        args.jobLog("detected ".concat(numValues, " unique cropdetect values - calculating best result"));
                        videoStream = (_d = (_c = file === null || file === void 0 ? void 0 : file.ffProbeData) === null || _c === void 0 ? void 0 : _c.streams) === null || _d === void 0 ? void 0 : _d.filter(metadataUtils_1.isVideo)[0];
                        if (!videoStream) {
                            throw new Error('Failed to find a video stream - why are you attempting to de-letterbox a non-video file?');
                        }
                        inputWidth = Number(videoStream.width);
                        outputWidth_1 = 0;
                        outputX_1 = 0;
                        // check for an easy exit - is the native width a meaningful percent of total samples
                        if (((_e = cropWidthFrequency.get(inputWidth)) !== null && _e !== void 0 ? _e : 0) > (numValues * (relevantPct / 100))) {
                            // video appears to be native width
                            outputWidth_1 = inputWidth;
                            outputX_1 = 0;
                        }
                        else {
                            // video appears to be pillarboxed
                            // find the maximum value representing at least {relevantPct}% of sampled frames
                            cropWidthFrequency.forEach(function (widthVal, widthFrequency) {
                                if ((widthVal > outputWidth_1) && (widthFrequency >= (numValues * (relevantPct / 100)))) {
                                    outputWidth_1 = widthVal;
                                }
                            });
                            xOffsetCount_1 = 0;
                            (_f = cropXOffsetFrequency.get(outputWidth_1)) === null || _f === void 0 ? void 0 : _f.forEach(function (offsetVal, offsetFrequency) {
                                if (offsetFrequency > xOffsetCount_1) {
                                    outputX_1 = offsetVal;
                                    xOffsetCount_1 = offsetFrequency;
                                }
                            });
                        }
                        inputHeight = Number(videoStream.height);
                        outputHeight_1 = 0;
                        outputY_1 = 0;
                        // check for an easy exit - is the native height a meaningful percent of total samples
                        if (((_g = cropHeightFrequency.get(inputHeight)) !== null && _g !== void 0 ? _g : 0) > (numValues * (relevantPct / 100))) {
                            outputHeight_1 = inputHeight;
                            outputY_1 = 0;
                        }
                        else {
                            // video appears to be letterboxed
                            // find the maximum value representing at least {relevantPct}% of sampled frames
                            cropHeightFrequency.forEach(function (heightVal, heightFrequency) {
                                if ((heightVal > outputHeight_1) && (heightFrequency >= (numValues * (relevantPct / 100)))) {
                                    outputHeight_1 = heightVal;
                                }
                            });
                            yOffsetCount_1 = 0;
                            (_h = cropYOffsetFrequency.get(outputHeight_1)) === null || _h === void 0 ? void 0 : _h.forEach(function (offsetVal, offsetFrequency) {
                                if (offsetFrequency >= yOffsetCount_1) {
                                    outputY_1 = offsetVal;
                                    yOffsetCount_1 = offsetFrequency;
                                }
                            });
                        }
                        // build the return CropInfo object from our selected values
                        returnInfo = {
                            w: outputWidth_1,
                            h: outputHeight_1,
                            x: outputX_1,
                            y: outputY_1,
                        };
                    }
                    else {
                        // return the only detected value
                        returnInfo = cropValues[0];
                    }
                    args.jobLog("returning crop info: ".concat(JSON.stringify(returnInfo)));
                    return [4 /*yield*/, (0, exports.sleep)(100)];
                case 8:
                    _j.sent();
                    args.jobLog('<=================== end ===================>');
                    return [2 /*return*/, returnInfo];
            }
        });
    });
};
exports.getCropInfo = getCropInfo;

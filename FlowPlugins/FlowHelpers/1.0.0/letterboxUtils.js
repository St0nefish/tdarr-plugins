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
var getCropInfoString = function (cropInfo) { return ("".concat(cropInfo.w, ":").concat(cropInfo.h, ":").concat(cropInfo.x, ":").concat(cropInfo.y)); };
exports.getCropInfoString = getCropInfoString;
// eslint-disable-next-line require-await
var sleep = function (ms) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, ms); })];
}); }); };
exports.sleep = sleep;
var getCropInfo = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var os, cropRegex, totalDuration, startOffset, endOffset, scannedTime, fps, spawnArgs, response, cropValues, numSamples, cropValueFrequency, cropWidthFrequency, cropXOffsetFrequency, cropHeightFrequency, cropYOffsetFrequency, numValues, returnInfo, videoStream, inputWidth, outputWidth_1, outputX_1, xOffsetCount_1, inputHeight, outputHeight_1, outputY_1, yOffsetCount_1;
    var _a, _b, _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                os = require('os');
                cropRegex = /(\d+:\d+:\d+:\d+)/gm;
                totalDuration = Math.round(Number((_b = (_a = args.inputFileObj.ffProbeData.format) === null || _a === void 0 ? void 0 : _a.duration) !== null && _b !== void 0 ? _b : 0));
                args.jobLog("will scan ".concat(Math.round(totalDuration * 0.90), " seconds of the total ").concat(totalDuration, " seconds"));
                startOffset = Math.round(0.05 * totalDuration);
                endOffset = Math.round(0.95 * totalDuration);
                scannedTime = totalDuration - (startOffset + endOffset);
                fps = 250 / (totalDuration * 0.90);
                // log some details
                args.jobLog("total duration:".concat(totalDuration, "s, scanned duration:").concat(scannedTime, "s, ")
                    + "start offset:".concat(startOffset, "s, end offset:").concat(endOffset, ", scan framerate:").concat(fps, "fps"));
                spawnArgs = [];
                // always hide banner and stats
                spawnArgs.push('-hide_banner', '-nostats');
                // set start offset
                spawnArgs.push('-ss', "".concat(600));
                // set sample length
                spawnArgs.push('-to', "".concat(900));
                // set input file
                spawnArgs.push('-i', args.inputFileObj._id);
                // set cropdetect settings
                spawnArgs.push('-vf', "fps=fps=".concat(0.1, ",mestimate,cropdetect=mode=mvedges,metadata=mode=print"));
                // no output file
                spawnArgs.push('-f', 'null', '-');
                return [4 /*yield*/, (new cliUtils_1.CLI({
                        cli: args.ffmpegPath,
                        spawnArgs: spawnArgs,
                        spawnOpts: {},
                        jobLog: args.jobLog,
                        outputFilePath: args.inputFileObj._id,
                        inputFileObj: args.inputFileObj,
                        logFullCliOutput: args.logFullCliOutput,
                        updateWorker: args.updateWorker,
                        args: args,
                    })).runCli()];
            case 1:
                response = _f.sent();
                // logs
                return [4 /*yield*/, (0, exports.sleep)(100)];
            case 2:
                // logs
                _f.sent();
                args.jobLog('<========== cropdata scan complete ==========>');
                return [4 /*yield*/, (0, exports.sleep)(100)];
            case 3:
                _f.sent();
                args.jobLog("parsing [".concat(response.errorLogFull.length, "] total lines of log data"));
                cropValues = response.errorLogFull
                    .filter(function (line) { return line.startsWith('[Parsed_cropdetect_'); })
                    .map(function (line) { return line.split(os.EOL)[0]; })
                    .map(function (line) { return line.split('crop=').pop(); })
                    .map(function (line) { return (0, exports.getCropInfoFromString)(String(line)); });
                numSamples = cropValues.length;
                args.jobLog("parsing [".concat(numSamples, "] lines containing cropdetect data"));
                cropValueFrequency = {};
                cropWidthFrequency = {};
                cropXOffsetFrequency = {};
                cropHeightFrequency = {};
                cropYOffsetFrequency = {};
                // iterate to parse
                cropValues.forEach(function (cropInfo) {
                    var _a, _b, _c, _d, _e, _f, _g;
                    var _h, _j;
                    var cropInfoString = (0, exports.getCropInfoString)(cropInfo);
                    cropValueFrequency[cropInfoString] = ((_a = cropValueFrequency[cropInfoString]) !== null && _a !== void 0 ? _a : 0) + 1;
                    // track width and x-offset frequencies
                    cropWidthFrequency[cropInfo.w] = ((_b = cropWidthFrequency[cropInfo.w]) !== null && _b !== void 0 ? _b : 0) + 1;
                    (_c = cropXOffsetFrequency[_h = cropInfo.w]) !== null && _c !== void 0 ? _c : (cropXOffsetFrequency[_h] = {});
                    cropXOffsetFrequency[cropInfo.w][cropInfo.x] = ((_d = cropXOffsetFrequency[cropInfo.w][cropInfo.x]) !== null && _d !== void 0 ? _d : 0) + 1;
                    // track height and y-offset frequencies
                    cropHeightFrequency[cropInfo.h] = ((_e = cropHeightFrequency[cropInfo.h]) !== null && _e !== void 0 ? _e : 0) + 1;
                    (_f = cropYOffsetFrequency[_j = cropInfo.h]) !== null && _f !== void 0 ? _f : (cropYOffsetFrequency[_j] = {});
                    cropYOffsetFrequency[cropInfo.h][cropInfo.y] = ((_g = cropYOffsetFrequency[cropInfo.h][cropInfo.y]) !== null && _g !== void 0 ? _g : 0) + 1;
                });
                // frequency logs
                return [4 /*yield*/, (0, exports.sleep)(100)];
            case 4:
                // frequency logs
                _f.sent();
                args.jobLog('<========== start frequency data ==========>');
                return [4 /*yield*/, (0, exports.sleep)(100)];
            case 5:
                _f.sent();
                args.jobLog("crop info frequencies: ".concat(JSON.stringify(cropValueFrequency)));
                return [4 /*yield*/, (0, exports.sleep)(20)];
            case 6:
                _f.sent();
                args.jobLog("crop info width frequencies: ".concat(JSON.stringify(cropWidthFrequency)));
                return [4 /*yield*/, (0, exports.sleep)(20)];
            case 7:
                _f.sent();
                args.jobLog("crop info x-offset frequencies: ".concat(JSON.stringify(cropXOffsetFrequency)));
                return [4 /*yield*/, (0, exports.sleep)(20)];
            case 8:
                _f.sent();
                args.jobLog("crop info height frequencies: ".concat(JSON.stringify(cropHeightFrequency)));
                return [4 /*yield*/, (0, exports.sleep)(20)];
            case 9:
                _f.sent();
                args.jobLog("crop info y-offset frequencies: ".concat(JSON.stringify(cropYOffsetFrequency)));
                return [4 /*yield*/, (0, exports.sleep)(100)];
            case 10:
                _f.sent();
                args.jobLog('<=========== end frequency data ===========>');
                return [4 /*yield*/, (0, exports.sleep)(100)];
            case 11:
                _f.sent();
                numValues = Object.keys(cropValueFrequency).length;
                if (numValues > 1) {
                    args.jobLog("detected ".concat(numValues, " unique cropdetect values - calculating best result"));
                    videoStream = (_e = (_d = (_c = args.inputFileObj) === null || _c === void 0 ? void 0 : _c.ffProbeData) === null || _d === void 0 ? void 0 : _d.streams) === null || _e === void 0 ? void 0 : _e.filter(metadataUtils_1.isVideo)[0];
                    if (!videoStream) {
                        throw new Error('Failed to find a video stream - why are you attempting to de-letterbox a non-video file?');
                    }
                    inputWidth = Number(videoStream.width);
                    outputWidth_1 = 0;
                    outputX_1 = 0;
                    // if native width is present and at least 5% of frames keep it
                    if (cropWidthFrequency[inputWidth] && cropWidthFrequency[inputWidth] >= (numValues * 0.05)) {
                        outputWidth_1 = inputWidth;
                        outputX_1 = 0;
                    }
                    else {
                        // weird, video appears to be pillarboxed - find the maximum value representing at least 5% of sampled frames
                        Object.keys(cropWidthFrequency).forEach(function (widthStr) {
                            var widthVal = Number(widthStr);
                            if ((widthVal > outputWidth_1) && (cropWidthFrequency[widthVal] >= (numValues * 0.05))) {
                                outputWidth_1 = widthVal;
                            }
                        });
                        xOffsetCount_1 = 0;
                        Object.keys(cropXOffsetFrequency[outputWidth_1]).forEach(function (offsetStr) {
                            var offsetVal = Number(offsetStr);
                            if (cropXOffsetFrequency[outputWidth_1][offsetVal] > xOffsetCount_1) {
                                outputX_1 = offsetVal;
                                xOffsetCount_1 = cropXOffsetFrequency[outputWidth_1][offsetVal];
                            }
                        });
                    }
                    inputHeight = Number(videoStream.height);
                    outputHeight_1 = 0;
                    outputY_1 = 0;
                    // if native height is present and at least 5% of frames keep it
                    if (cropHeightFrequency[inputHeight] && cropHeightFrequency[inputHeight] >= (numValues * 0.05)) {
                        outputHeight_1 = inputHeight;
                        outputY_1 = 0;
                    }
                    else {
                        // video appears to be letterboxed - find the maximum value representing at least 5% of sampled frames
                        Object.keys(cropHeightFrequency).forEach(function (heightStr) {
                            var heightVal = Number(heightStr);
                            if ((heightVal > outputHeight_1) && (cropHeightFrequency[heightVal] >= (numValues * 0.05))) {
                                outputHeight_1 = heightVal;
                            }
                        });
                        yOffsetCount_1 = 0;
                        Object.keys(cropYOffsetFrequency[outputHeight_1]).forEach(function (offsetStr) {
                            var offsetVal = Number(offsetStr);
                            if (cropYOffsetFrequency[outputHeight_1][offsetVal] >= yOffsetCount_1) {
                                outputY_1 = offsetVal;
                                yOffsetCount_1 = cropYOffsetFrequency[outputHeight_1][offsetVal];
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
            case 12:
                _f.sent();
                args.jobLog('<=================== end ===================>');
                return [2 /*return*/, returnInfo];
        }
    });
}); };
exports.getCropInfo = getCropInfo;

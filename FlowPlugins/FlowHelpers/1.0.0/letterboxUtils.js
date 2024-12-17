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
// args: input plugin argument object
// file: file to detect letterboxing for
// enableHwDecoding: use hardware decoding (if available)
// cropMode: handbrake crop-mode - 'auto' or 'conservative'
// startOffsetPct: percent of the file to skip at the beginning (avoid scanning intros)
// endOffsetPct: percent of the file to skip at the end (avoid scanning outro)
// samplesPerMinute: number of image samples to take per minute of scanned video
// minCropPct: minimum percent of dimension to be removed to be worth cropping
var getCropInfo = function (args_1, file_1) {
    var args_2 = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args_2[_i - 2] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([args_1, file_1], args_2, true), void 0, function (args, file, enableHwDecoding, cropMode, startOffsetPct, endOffsetPct, samplesPerMinute, minCropPct) {
        var os, exec, videoStream, totalDuration, startTime, endTime, scannedTime, numPreviews, command, commandStr, result;
        var _a, _b, _c, _d;
        if (enableHwDecoding === void 0) { enableHwDecoding = true; }
        if (cropMode === void 0) { cropMode = 'conservative'; }
        if (startOffsetPct === void 0) { startOffsetPct = 5; }
        if (endOffsetPct === void 0) { endOffsetPct = 5; }
        if (samplesPerMinute === void 0) { samplesPerMinute = 2; }
        if (minCropPct === void 0) { minCropPct = 2; }
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    os = require('os');
                    exec = require('util').promisify(require('child_process').exec);
                    // ToDo - remove
                    args.jobLog("hardware type: ".concat(args.nodeHardwareType));
                    args.jobLog("worker type: ".concat(args.workerType));
                    videoStream = (_b = (_a = file === null || file === void 0 ? void 0 : file.ffProbeData) === null || _a === void 0 ? void 0 : _a.streams) === null || _b === void 0 ? void 0 : _b.filter(metadataUtils_1.isVideo)[0];
                    if (!videoStream) {
                        throw new Error('Failed to find a video stream - why are you attempting to de-letterbox a non-video file?');
                    }
                    totalDuration = Math.round(Number((_d = (_c = file.ffProbeData.format) === null || _c === void 0 ? void 0 : _c.duration) !== null && _d !== void 0 ? _d : 0));
                    startTime = Math.round((startOffsetPct / 100) * totalDuration);
                    endTime = Math.round(((100 - endOffsetPct) / 100) * totalDuration);
                    scannedTime = endTime - startTime;
                    numPreviews = Math.round((scannedTime / 60) * samplesPerMinute);
                    // log execution details
                    args.jobLog("will scan [".concat(scannedTime, "/").concat(totalDuration, "]s (start:[").concat(startTime, "s], end:[").concat(endTime, "s]), ")
                        + "mode:[".concat(cropMode, "], previews:[").concat(numPreviews, "]"));
                    command = [];
                    // use handbrake
                    command.push(args.handbrakePath);
                    // input file
                    command.push('-i', file._id);
                    // only scan main feature
                    command.push('--main-feature');
                    // crop mode
                    command.push('--crop-mode', cropMode);
                    // number of previews (persist to disk)
                    command.push('--previews', "".concat(numPreviews, ":1"));
                    // set start time
                    command.push('--start-at', "seconds:".concat(startTime));
                    // set end time
                    command.push('--stop-at', "seconds:".concat(endTime));
                    // handle hardware decoding
                    if (enableHwDecoding) {
                        // ToDo - determine decoder
                        command.push('--enable-hw-decoding', 'nvdec');
                    }
                    // scan only
                    command.push('--scan');
                    // pipe to grep to limit log volume to only the line containing scan results
                    command.push('|', 'grep', 'autocrop = ');
                    commandStr = command.join(' ');
                    // log command
                    args.jobLog("scan command: ".concat(commandStr));
                    return [4 /*yield*/, exec(commandStr)];
                case 1:
                    result = _e.sent();
                    // log result
                    args.jobLog("scan result: ".concat(result));
                    // // logs
                    // await sleep(100);
                    // args.jobLog('<========== cropdetect scan complete ==========>');
                    // await sleep(100);
                    // args.jobLog(`parsing [${response.errorLogFull.length}] total lines of log data`);
                    // // build a list of crop settings
                    // const cropValues: CropInfo[] = response.errorLogFull
                    //   .filter((line) => line.startsWith('[Parsed_cropdetect_'))
                    //   .map((line) => line.split(os.EOL)[0])
                    //   .map((line) => line.split('crop=').pop())
                    //   .map((line) => getCropInfoFromString(String(line)));
                    // // determine number of samples we're working with
                    // args.jobLog(`parsing [${cropValues.length}] lines containing cropdetect data`);
                    // // build a map of frequency for overall w:h:x:y
                    // const cropValueFrequency = new Map<string, number>();
                    // // build arrays separately tracking width and height
                    // const cropWidthFrequency = new Map<number, number>();
                    // const cropXOffsetFrequency = new Map<number, Map<number, number>>();
                    // const cropHeightFrequency = new Map<number, number>();
                    // const cropYOffsetFrequency = new Map<number, Map<number, number>>();
                    // // iterate to parse
                    // cropValues.forEach((cropInfo) => {
                    //   const cropInfoString = getCropInfoString(cropInfo);
                    //   cropValueFrequency.set(cropInfoString, (cropValueFrequency.get(cropInfoString) ?? 0) + 1);
                    //   // track width and x-offset frequencies
                    //   cropWidthFrequency.set(cropInfo.w, (cropWidthFrequency.get(cropInfo.w) ?? 0) + 1);
                    //   if (!cropXOffsetFrequency.get(cropInfo.w)) cropXOffsetFrequency.set(cropInfo.w, new Map<number, number>());
                    //   cropXOffsetFrequency.get(cropInfo.w)?.set(
                    //     cropInfo.x, (cropXOffsetFrequency.get(cropInfo.w)?.get(cropInfo.x) ?? 0) + 1,
                    //   );
                    //   // track height and y-offset frequencies
                    //   cropHeightFrequency.set(cropInfo.h, (cropHeightFrequency.get(cropInfo.h) ?? 0) + 1);
                    //   if (!cropYOffsetFrequency.get(cropInfo.h)) cropYOffsetFrequency.set(cropInfo.h, new Map<number, number>());
                    //   cropYOffsetFrequency.get(cropInfo.h)?.set(
                    //     cropInfo.y, (cropYOffsetFrequency.get(cropInfo.h)?.get(cropInfo.y) ?? 0) + 1,
                    //   );
                    // });
                    // // frequency logs
                    // await sleep(100);
                    // args.jobLog('<============ frequency data ============>');
                    // await sleep(100);
                    // args.jobLog(`detected crop info frequencies: ${JSON.stringify(cropValueFrequency)}`);
                    // await sleep(100);
                    // args.jobLog('<============ frequency data ============>');
                    // await sleep(100);
                    // // determine if we can just return the top value or if we need to parse
                    // const numValues = cropValueFrequency.size;
                    // let returnInfo: CropInfo;
                    // if (numValues > 1) {
                    //   args.jobLog(`detected ${numValues} unique cropdetect values - calculating best result`);
                    //   // ==== determine width and X offset ====
                    //   const inputWidth: number = Number(videoStream.width);
                    //   let outputWidth: number = 0;
                    //   let outputX: number = 0;
                    //   // check for an easy exit - is the native width a meaningful percent of total samples
                    //   if ((cropWidthFrequency.get(inputWidth) ?? 0) > (numValues * (relevantPct / 100))) {
                    //     // video appears to be native width
                    //     outputWidth = inputWidth;
                    //     outputX = 0;
                    //   } else {
                    //     // video appears to be pillarboxed
                    //     // find the maximum value representing at least {relevantPct}% of sampled frames
                    //     cropWidthFrequency.forEach((widthVal: number, widthFrequency: number) => {
                    //       if ((widthVal > outputWidth) && (widthFrequency >= (numValues * (relevantPct / 100)))) {
                    //         outputWidth = widthVal;
                    //       }
                    //     });
                    //     // now grab the most frequent x-offset for the selected width value
                    //     let xOffsetCount: number = 0;
                    //     cropXOffsetFrequency.get(outputWidth)?.forEach((offsetVal: number, offsetFrequency: number) => {
                    //       if (offsetFrequency > xOffsetCount) {
                    //         outputX = offsetVal;
                    //         xOffsetCount = offsetFrequency;
                    //       }
                    //     });
                    //   }
                    //   // ==== determine height and Y offset ====
                    //   const inputHeight: number = Number(videoStream.height);
                    //   let outputHeight: number = 0;
                    //   let outputY: number = 0;
                    //   // check for an easy exit - is the native height a meaningful percent of total samples
                    //   if ((cropHeightFrequency.get(inputHeight) ?? 0) > (numValues * (relevantPct / 100))) {
                    //     outputHeight = inputHeight;
                    //     outputY = 0;
                    //   } else {
                    //     // video appears to be letterboxed
                    //     // find the maximum value representing at least {relevantPct}% of sampled frames
                    //     cropHeightFrequency.forEach((heightVal: number, heightFrequency: number) => {
                    //       if ((heightVal > outputHeight) && (heightFrequency >= (numValues * (relevantPct / 100)))) {
                    //         outputHeight = heightVal;
                    //       }
                    //     });
                    //     // now grab the most frequent y-offset for the selected height value
                    //     let yOffsetCount: number = 0;
                    //     cropYOffsetFrequency.get(outputHeight)?.forEach((offsetVal: number, offsetFrequency: number) => {
                    //       if (offsetFrequency >= yOffsetCount) {
                    //         outputY = offsetVal;
                    //         yOffsetCount = offsetFrequency;
                    //       }
                    //     });
                    //   }
                    //   // build the return CropInfo object from our selected values
                    //   returnInfo = {
                    //     w: outputWidth,
                    //     h: outputHeight,
                    //     x: outputX,
                    //     y: outputY,
                    //   };
                    // } else {
                    //   // return the only detected value
                    //   returnInfo = cropValues[0];
                    // }
                    // args.jobLog(`returning crop info: ${JSON.stringify(returnInfo)}`);
                    // await sleep(100);
                    // args.jobLog('<=================== end ===================>');
                    // return returnInfo;
                    return [2 /*return*/, {
                            w: 0,
                            h: 0,
                            x: 0,
                            y: 0,
                        }];
            }
        });
    });
};
exports.getCropInfo = getCropInfo;

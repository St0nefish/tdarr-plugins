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
exports.getCropInfo = exports.sleep = exports.getCropInfoFromString = void 0;
var cliUtils_1 = require("./cliUtils");
var metadataUtils_1 = require("./metadataUtils");
var getCropInfoFromString = function (cropInfoStr) {
    var _a, _b, _c, _d;
    var split = String(cropInfoStr).split('/');
    return {
        top: Number((_a = split[0]) !== null && _a !== void 0 ? _a : 0),
        bottom: Number((_b = split[1]) !== null && _b !== void 0 ? _b : 0),
        left: Number((_c = split[2]) !== null && _c !== void 0 ? _c : 0),
        right: Number((_d = split[3]) !== null && _d !== void 0 ? _d : 0),
    };
};
exports.getCropInfoFromString = getCropInfoFromString;
// get the crop info string
// export const getCropInfoString = (cropInfo: CropInfo): string => (
//   `${cropInfo.w}:${cropInfo.h}:${cropInfo.x}:${cropInfo.y}`
// );
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
        var videoStream, totalDuration, startTime, endTime, scannedTime, numPreviews, spawnArgs, response, resultLine, autocropRegex, match, autocrop;
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
                    spawnArgs = [];
                    // input file
                    spawnArgs.push('-i', "".concat(file._id));
                    // only scan main feature
                    spawnArgs.push('--main-feature');
                    // crop mode
                    spawnArgs.push('--crop-mode', cropMode);
                    // number of previews (persist to disk)
                    spawnArgs.push('--previews', "".concat(numPreviews, ":1"));
                    // set start time
                    spawnArgs.push('--start-at', "seconds:".concat(startTime));
                    // set end time
                    spawnArgs.push('--stop-at', "seconds:".concat(endTime));
                    // handle hardware decoding
                    if (enableHwDecoding) {
                        // ToDo - determine decoder
                        spawnArgs.push('--enable-hw-decoding', 'nvdec');
                    }
                    // scan only
                    spawnArgs.push('--scan');
                    // log command
                    args.jobLog("scan command: ".concat(args.handbrakePath, " ").concat(spawnArgs.join(' ')));
                    return [4 /*yield*/, (new cliUtils_1.CLI({
                            cli: args.handbrakePath,
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
                    response = _e.sent();
                    resultLine = response.errorLogFull.filter(function (line) { return line.includes('autocrop = '); })[0];
                    args.jobLog("scan result details: ".concat(resultLine));
                    autocropRegex = /(\d+\/\d+\/\d+\/\d+)/;
                    match = autocropRegex.exec(resultLine);
                    autocrop = '';
                    if (match) {
                        autocrop = match[1];
                    }
                    args.jobLog("autocrop: ".concat(autocrop));
                    // convert string to object and return
                    return [2 /*return*/, (0, exports.getCropInfoFromString)(autocrop)];
            }
        });
    });
};
exports.getCropInfo = getCropInfo;

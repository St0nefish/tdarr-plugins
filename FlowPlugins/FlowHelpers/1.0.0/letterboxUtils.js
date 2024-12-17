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
exports.getCropInfo = exports.getCropInfoFromString = exports.CropInfo = void 0;
var cliUtils_1 = require("./cliUtils");
var metadataUtils_1 = require("./metadataUtils");
// class to hold crop info data
var CropInfo = /** @class */ (function () {
    // constructor to create a CropInfo object from raw inputs
    function CropInfo(top, bottom, left, right) {
        var _this = this;
        // determine if this object determines that the video should be cropped
        this.shouldCrop = function () { return _this.top > 0 || _this.bottom > 0 || _this.right > 0 || _this.left > 0; };
        // get total vertical crop
        this.verticalCrop = function () { return _this.top + _this.bottom; };
        // get total  horizontal crop
        this.horizontalCrop = function () { return _this.left + _this.right; };
        // get the string used as an input to ffmpeg crop
        this.ffmpegCropString = function (file) {
            var _a, _b, _c, _d, _e;
            // first grab the video stream from the file
            var videoStream = (_c = (_b = (_a = file === null || file === void 0 ? void 0 : file.ffProbeData) === null || _a === void 0 ? void 0 : _a.streams) === null || _b === void 0 ? void 0 : _b.filter(metadataUtils_1.isVideo)) === null || _c === void 0 ? void 0 : _c[0];
            if (!videoStream) {
                throw new Error("Could not find stream in: ".concat(file._id));
            }
            // get input resolution
            var inputWidth = (_d = videoStream.width) !== null && _d !== void 0 ? _d : 0;
            var inputHeight = (_e = videoStream.height) !== null && _e !== void 0 ? _e : 0;
            // calculate new width
            var newWidth = inputWidth - _this.horizontalCrop();
            var newHeight = inputHeight - _this.verticalCrop();
            // build string
            return "w=".concat(newWidth, ":h=").concat(newHeight, ":x=").concat(_this.left, ":y=").concat(_this.top);
        };
        this.top = top;
        this.bottom = bottom;
        this.left = left;
        this.right = right;
    }
    return CropInfo;
}());
exports.CropInfo = CropInfo;
// create a crop info object from the string output by Handbrake
var getCropInfoFromString = function (cropInfoStr) {
    var _a, _b, _c, _d;
    var split = String(cropInfoStr).split('/');
    return new CropInfo(Number((_a = split[0]) !== null && _a !== void 0 ? _a : 0), Number((_b = split[1]) !== null && _b !== void 0 ? _b : 0), Number((_c = split[2]) !== null && _c !== void 0 ? _c : 0), Number((_d = split[3]) !== null && _d !== void 0 ? _d : 0));
};
exports.getCropInfoFromString = getCropInfoFromString;
// function to get hardware decoder from configured hardware type
var getHwDecoder = function (hardwareType) {
    switch (hardwareType) {
        case 'nvenc':
            return 'nvdec';
        case 'qsv':
            return 'qsv';
        default:
            return null;
    }
};
// function to get crop info from a video file
// args: input plugin argument object
// file: file to detect letterboxing for
// scanConfig: ScanConfig object
var getCropInfo = function (args, file, scanConfig) { return __awaiter(void 0, void 0, void 0, function () {
    var os, videoStream, cropMode, enableHwDecoding, minCropPct, totalDuration, startTime, endTime, scannedTime, numPreviews, spawnArgs, hwDecoder, response, resultLine, autocropRegex, match, autocrop, cropInfo;
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    return __generator(this, function (_m) {
        switch (_m.label) {
            case 0:
                os = require('os');
                // ToDo - remove
                args.jobLog("hardware type: ".concat(args.nodeHardwareType));
                args.jobLog("worker type: ".concat(args.workerType));
                videoStream = (_b = (_a = file === null || file === void 0 ? void 0 : file.ffProbeData) === null || _a === void 0 ? void 0 : _a.streams) === null || _b === void 0 ? void 0 : _b.filter(metadataUtils_1.isVideo)[0];
                if (!videoStream) {
                    throw new Error('Failed to find a video stream - why are you attempting to de-letterbox a non-video file?');
                }
                cropMode = (_c = scanConfig.cropMode) !== null && _c !== void 0 ? _c : 'conservative';
                enableHwDecoding = (_d = scanConfig.enableHwDecoding) !== null && _d !== void 0 ? _d : false;
                minCropPct = (_e = scanConfig.minCropPct) !== null && _e !== void 0 ? _e : 0;
                totalDuration = Math.round(Number((_g = (_f = file.ffProbeData.format) === null || _f === void 0 ? void 0 : _f.duration) !== null && _g !== void 0 ? _g : 0));
                startTime = Math.round((((_h = scanConfig.startOffsetPct) !== null && _h !== void 0 ? _h : 5) / 100) * totalDuration);
                endTime = Math.round(((100 - ((_j = scanConfig.endOffsetPct) !== null && _j !== void 0 ? _j : 5)) / 100) * totalDuration);
                scannedTime = endTime - startTime;
                numPreviews = Math.round((scannedTime / 60) * ((_k = scanConfig.samplesPerMinute) !== null && _k !== void 0 ? _k : 2));
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
                hwDecoder = (_l = scanConfig.hwDecoder) !== null && _l !== void 0 ? _l : getHwDecoder(args.nodeHardwareType);
                if (enableHwDecoding && hwDecoder) {
                    spawnArgs.push('--enable-hw-decoding', hwDecoder);
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
                response = _m.sent();
                resultLine = response.errorLogFull.filter(function (line) { return line.includes('autocrop = '); })[0];
                if (!resultLine) {
                    throw new Error('failed to get autocrop results from Handbrake scan');
                }
                // parse out the key parts of the line - sometimes has line feed
                resultLine = resultLine.substring(resultLine.indexOf('scan: '), resultLine.lastIndexOf(os.EOL) || resultLine.length);
                autocropRegex = /(?<=autocrop = )(\d+\/\d+\/\d+\/\d+)/;
                match = autocropRegex.exec(resultLine);
                autocrop = '';
                if (match) {
                    autocrop = match[0];
                }
                args.jobLog("".concat(resultLine));
                args.jobLog("autocrop: [".concat(autocrop, "]"));
                cropInfo = (0, exports.getCropInfoFromString)(autocrop);
                // ==== determine if we should zero some fields for being within ignore limits ==== //
                // first check width
                if (cropInfo.horizontalCrop() < (Number(videoStream.width) * (minCropPct / 100))) {
                    // total horizontal crop is less than ignore percentile - zero them out
                    cropInfo.left = 0;
                    cropInfo.right = 0;
                }
                // then check height
                if (cropInfo.verticalCrop() < (Number(videoStream.height) * (minCropPct / 100))) {
                    // total vertical crop is less tan ignore percentile - zero them out
                    cropInfo.top = 0;
                    cropInfo.bottom = 0;
                }
                return [2 /*return*/, cropInfo];
        }
    });
}); };
exports.getCropInfo = getCropInfo;

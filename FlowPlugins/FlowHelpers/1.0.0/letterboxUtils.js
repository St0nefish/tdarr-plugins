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
exports.CropInfo = void 0;
var cliUtils_1 = require("./cliUtils");
var metadataUtils_1 = require("./metadataUtils");
// function to get hardware decoder from configured hardware type
var getHwDecoder = function (hardwareType) {
    if (hardwareType === 'nvenc') {
        return 'nvdec';
    }
    return hardwareType;
};
// class to hold crop info data
var CropInfo = /** @class */ (function () {
    // constructor to create a CropInfo object from raw inputs
    function CropInfo(inputWidth, inputHeight, outputWidth, outputHeight, outputX, outputY) {
        this.inputWidth = inputWidth;
        this.inputHeight = inputHeight;
        this.outputWidth = outputWidth;
        this.outputHeight = outputHeight;
        this.outputX = outputX;
        this.outputY = outputY;
    }
    // create a crop info object from the string output by Handbrake
    CropInfo.fromHandBrakeAutocropString = function (videoStream, cropInfoStr) {
        var _a, _b, _c, _d, _e;
        if (!videoStream.width || !videoStream.height) {
            throw new Error('input stream has no dimensions - unable to calculate crop info');
        }
        var inputWidth = videoStream.width;
        var inputHeight = videoStream.height;
        // split autocrop string to numeric values
        var split = String(cropInfoStr).split('/');
        var cTop = Number((_a = split[0]) !== null && _a !== void 0 ? _a : 0);
        var cBottom = Number((_b = split[1]) !== null && _b !== void 0 ? _b : 0);
        var cLeft = Number((_c = split[2]) !== null && _c !== void 0 ? _c : 0);
        var cRight = Number((_d = split[3]) !== null && _d !== void 0 ? _d : 0);
        // calculate new values
        var newWidth = ((_e = videoStream.width) !== null && _e !== void 0 ? _e : 0) - (cLeft + cRight);
        var newHeight = inputHeight - (cTop + cBottom);
        // create and return object
        return new CropInfo(inputWidth, inputHeight, newWidth, newHeight, cLeft, cTop);
    };
    // create a crop info object from a JSON string
    CropInfo.fromJsonString = function (json) {
        // parse json
        var parsedCropInfo = JSON.parse(json, function (key, value) {
            var _a;
            // cast any keys expected to contain numeric values to numbers
            if (['inputWidth', 'inputHeight', 'outputWidth', 'outputHeight', 'outputX', 'outputY'].includes(key)
                && typeof value === 'string') {
                return Number((_a = value.trim()) !== null && _a !== void 0 ? _a : 0);
            }
            return value;
        });
        // if any value is missing then this wasn't a proper CropInfo object so return null
        if (parsedCropInfo.inputWidth === undefined
            || parsedCropInfo.inputHeight === undefined
            || parsedCropInfo.outputWidth === undefined
            || parsedCropInfo.outputHeight === undefined
            || parsedCropInfo.outputX === undefined
            || parsedCropInfo.outputY === undefined) {
            return null;
        }
        // otherwise this is valid, return it
        return parsedCropInfo;
    };
    // function to get crop info from a video file via HandBrake scan
    // args: input plugin argument object
    // file: file to detect letterboxing for
    // scanConfig: ScanConfig object
    CropInfo.fromHandBrakeScan = function (args, file, scanConfig) {
        return __awaiter(this, void 0, void 0, function () {
            var videoStream, cropMode, enableHwDecoding, hwDecoder, totalDuration, startTime, endTime, scannedTime, numPreviews, spawnArgs, response, resultLine, autocropRegex, match, autocropStr;
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        videoStream = (_b = (_a = file === null || file === void 0 ? void 0 : file.ffProbeData) === null || _a === void 0 ? void 0 : _a.streams) === null || _b === void 0 ? void 0 : _b.filter(metadataUtils_1.isVideo)[0];
                        if (!videoStream) {
                            throw new Error('File does not have a video stream');
                        }
                        cropMode = (_c = scanConfig.cropMode) !== null && _c !== void 0 ? _c : 'conservative';
                        enableHwDecoding = (_d = scanConfig.enableHwDecoding) !== null && _d !== void 0 ? _d : false;
                        hwDecoder = (!scanConfig.hwDecoder || scanConfig.hwDecoder === 'auto')
                            ? getHwDecoder(args.nodeHardwareType) : scanConfig.hwDecoder;
                        totalDuration = Math.round(Number((_f = (_e = file.ffProbeData.format) === null || _e === void 0 ? void 0 : _e.duration) !== null && _f !== void 0 ? _f : 0));
                        startTime = Math.round((((_g = scanConfig.startOffsetPct) !== null && _g !== void 0 ? _g : 0) / 100) * totalDuration);
                        endTime = Math.round(((100 - ((_h = scanConfig.endOffsetPct) !== null && _h !== void 0 ? _h : 0)) / 100) * totalDuration);
                        scannedTime = endTime - startTime;
                        numPreviews = Math.round(scannedTime / ((_j = scanConfig.secondsPerPreview) !== null && _j !== void 0 ? _j : 30));
                        // log execution details
                        args.jobLog("will scan [".concat(scannedTime, "/").concat(totalDuration, "]s (start:[").concat(startTime, "s], end:[").concat(endTime, "s]), ")
                            + "mode:[".concat(cropMode, "], previews:[").concat(numPreviews, "]"));
                        spawnArgs = [];
                        // input file
                        spawnArgs.push('-i', "".concat(file._id));
                        // set crop mode
                        spawnArgs.push('--crop-mode', cropMode);
                        // number of previews (persist to disk)
                        spawnArgs.push('--previews', "".concat(numPreviews, ":1"));
                        // set start time
                        spawnArgs.push('--start-at', "seconds:".concat(startTime));
                        // set end time
                        spawnArgs.push('--stop-at', "seconds:".concat(endTime));
                        // handle hardware decoding
                        if (enableHwDecoding && hwDecoder) {
                            spawnArgs.push('--enable-hw-decoding', hwDecoder);
                        }
                        // scan only
                        spawnArgs.push('--scan');
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
                        response = _k.sent();
                        resultLine = response.errorLogFull
                            .filter(function (line) { return line.includes('autocrop = '); })
                            .map(function (line) { return line.substring(line.indexOf('scan: '), line.lastIndexOf(require('os').EOL) || line.length); })[0];
                        if (!resultLine) {
                            throw new Error('failed to get autocrop results from Handbrake scan');
                        }
                        autocropRegex = /(?<=autocrop = )(\d+\/\d+\/\d+\/\d+)/;
                        match = autocropRegex.exec(resultLine);
                        autocropStr = '';
                        if (match) {
                            autocropStr = match[0];
                        }
                        args.jobLog("scan result: ".concat(resultLine));
                        args.jobLog("autocrop: ".concat(autocropStr));
                        // parse string to CropInfo object and return object
                        return [2 /*return*/, CropInfo.fromHandBrakeAutocropString(videoStream, autocropStr)];
                }
            });
        });
    };
    // get total vertical crop
    CropInfo.prototype.getVerticalCrop = function () {
        return this.inputHeight - this.outputHeight;
    };
    // get total  horizontal crop
    CropInfo.prototype.getHorizontalCrop = function () {
        return this.inputWidth - this.outputWidth;
    };
    // get the string used as an input to ffmpeg crop
    CropInfo.prototype.getFfmpegCropString = function () {
        return "w=".concat(this.outputWidth, ":h=").concat(this.outputHeight, ":x=").concat(this.outputX, ":y=").concat(this.outputY);
    };
    // get the string used as an input to handbrake crop
    CropInfo.prototype.getHandBrakeCropString = function () {
        // calculate top/bottom/left/right
        var cBottom = this.inputHeight - this.outputHeight - this.outputY;
        var cRight = this.inputWidth - this.outputWidth - this.outputX;
        return "".concat(this.outputY, "/").concat(cBottom, "/").concat(this.outputX, "/").concat(cRight);
    };
    // determine if a crop should be executed given the input minimum percentage
    CropInfo.prototype.shouldCrop = function (minCropPct) {
        // convert percentage to decimal
        var minCropMultiplier = minCropPct / 100;
        // first check height - it's more likely to require cropping
        if (this.getVerticalCrop() >= (this.inputHeight * minCropMultiplier)) {
            // total vertical crop meets minimum - return true
            return true;
        }
        // then check width - less likely to require cropping
        if (this.getHorizontalCrop() >= (this.inputWidth * minCropMultiplier)) {
            // total horizontal crop meets minimum - return true
            return true;
        }
        // neither dimension met minimums - return false
        return false;
    };
    // determine if this CropInfo is relevant to the input file
    CropInfo.prototype.isRelevant = function (file) {
        var _a, _b;
        var videoStream = (_b = (_a = file === null || file === void 0 ? void 0 : file.ffProbeData) === null || _a === void 0 ? void 0 : _a.streams) === null || _b === void 0 ? void 0 : _b.filter(metadataUtils_1.isVideo)[0];
        if (!videoStream) {
            // if the input file doesn't even have a video stream assume it's not relevant
            return false;
        }
        // check if file dimensions match this object's input dimensions
        return this.inputWidth === videoStream.width && this.inputHeight === videoStream.height;
    };
    return CropInfo;
}());
exports.CropInfo = CropInfo;

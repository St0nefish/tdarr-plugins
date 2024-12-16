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
exports.getCropInfo = exports.getCropInfoString = exports.getCropInfoFromString = void 0;
var cliUtils_1 = require("./cliUtils");
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
var getCropInfo = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var cropRegex, totalDuration, startOffset, endOffset, scannedTime, fps, spawnArgs, cli, response, cropValues, cropValueFrequency, cropWidthFrequency, cropXOffsetFrequency, cropHeightFrequency, cropYOffsetFrequency;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                cropRegex = /.*(?<=crop=)(\d+:\d+:\d+:\d+).*/g;
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
                spawnArgs.push('-ss', "".concat(startOffset));
                // set sample length
                spawnArgs.push('-to', "".concat(endOffset));
                // set input file
                spawnArgs.push('-i', args.inputFileObj._id);
                // set cropdetect settings
                spawnArgs.push('-vf', "fps=fps=".concat(fps, ",mestimate,cropdetect=mode=mvedges,metadata=mode=print"));
                // no output file
                spawnArgs.push('-f', 'null', '-');
                cli = new cliUtils_1.CLI({
                    cli: args.ffmpegPath,
                    spawnArgs: spawnArgs,
                    spawnOpts: {},
                    jobLog: args.jobLog,
                    outputFilePath: args.inputFileObj._id,
                    inputFileObj: args.inputFileObj,
                    logFullCliOutput: args.logFullCliOutput,
                    updateWorker: args.updateWorker,
                    args: args,
                });
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
                response = _c.sent();
                // logs
                args.jobLog('<========== scan complete ==========>');
                cropValues = response.errorLogFull.filter(function (line) { return line.startsWith('[Parsed_cropdetect_'); })
                    .map(function (line) { var _a; return (_a = cropRegex.exec(line)) === null || _a === void 0 ? void 0 : _a[1]; })
                    .filter(function (line) { return line; })
                    .map(function (line) { return String(line); })
                    .map(function (value) { return (0, exports.getCropInfoFromString)(String(value)); });
                // logs
                args.jobLog('<========== raw crop data ==========>');
                cropValues.forEach(function (cropInfo, index) {
                    args.jobLog("[".concat(index, "] - ").concat((0, exports.getCropInfoString)(cropInfo)));
                });
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
                args.jobLog('<========== frequency data ==========>');
                args.jobLog("parsed info from ".concat(cropValues.length, " total frames"));
                args.jobLog("crop info frequencies: ".concat(JSON.stringify(cropValueFrequency)));
                args.jobLog("crop info width frequencies: ".concat(JSON.stringify(cropWidthFrequency)));
                args.jobLog("crop info x-offset frequencies: ".concat(JSON.stringify(cropXOffsetFrequency)));
                args.jobLog("crop info height frequencies: ".concat(JSON.stringify(cropHeightFrequency)));
                args.jobLog("crop info y-offset frequencies: ".concat(JSON.stringify(cropYOffsetFrequency)));
                args.jobLog('<=============== end ===============>');
                return [2 /*return*/, cropValues];
        }
    });
}); };
exports.getCropInfo = getCropInfo;

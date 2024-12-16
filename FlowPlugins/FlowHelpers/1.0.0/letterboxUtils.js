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
exports.getCropInfo = exports.CropInfo = void 0;
var cliUtils_1 = require("./cliUtils");
var CropInfo = /** @class */ (function () {
    // constructor
    function CropInfo(w, h, x, y) {
        if (h === void 0) { h = 0; }
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        var _this = this;
        // width
        this.w = 0;
        // height
        this.h = 0;
        // x offset
        this.x = 0;
        // y offset
        this.y = 0;
        // toString
        this.toString = function () { return "".concat(_this.w, ":").concat(_this.h, ":").concat(_this.x, ":").concat(_this.y); };
        this.w = w;
        this.h = h;
        this.x = x;
        this.y = y;
    }
    return CropInfo;
}());
exports.CropInfo = CropInfo;
var getCropInfo = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var cropRegex, spawnArgs, cli, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                cropRegex = /.*(?<=crop=)(\d+:\d+:\d+:\d+).*/g;
                spawnArgs = [];
                // always hide banner and stats
                spawnArgs.push('-hide_banner', '-nostats');
                // set start offset
                spawnArgs.push('-ss', '0:10:00');
                // set sample length
                spawnArgs.push('-to', '0:20:00');
                // set input file
                spawnArgs.push('-i', args.inputFileObj._id);
                // set cropdetect settings
                spawnArgs.push('-vf', 'fps=fps=0.1,mestimate,cropdetect=mode=mvedges,metadata=mode=print');
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
                return [4 /*yield*/, cli.runCli()];
            case 1:
                res = _a.sent();
                // return a list of crop settings
                return [2 /*return*/, res.errorLogFull.filter(function (line) { return line.startsWith('[Parsed_cropdetect_'); })
                        .map(function (line) { var _a; return (_a = cropRegex.exec(line)) === null || _a === void 0 ? void 0 : _a[1]; })
                        .filter(function (line) { return line; })
                        .map(function (value) {
                        var _a, _b, _c, _d;
                        var split = String(value).split(':');
                        return new CropInfo(Number((_a = split[0]) !== null && _a !== void 0 ? _a : 0), Number((_b = split[1]) !== null && _b !== void 0 ? _b : 0), Number((_c = split[2]) !== null && _c !== void 0 ? _c : 0), Number((_d = split[3]) !== null && _d !== void 0 ? _d : 0));
                    })];
        }
    });
}); };
exports.getCropInfo = getCropInfo;

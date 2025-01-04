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
exports.getStreamSorter = exports.getOrGenerateTitle = exports.generateTitleForStream = exports.isForcedSubtitle = exports.isDescriptiveCommentaryStream = exports.isDescriptiveStream = exports.isCommentaryStream = exports.isStandardStream = exports.hasDescriptiveFlag = exports.hasCommentaryFlag = exports.streamMatchesLanguage = exports.streamMatchesLanguages = exports.getLanguageName = exports.getLanguageTag = exports.isLanguageUndefined = exports.getTitle = exports.getEncoder = exports.getBitDepthText = exports.getBitDepth = exports.getSampleRateText = exports.getSampleRate = exports.getChannelFromName = exports.getChannelsName = exports.isLosslessAudio = exports.getBitrateText = exports.getBitrate = exports.getResolutionName = exports.getTypeCountsMap = exports.setTypeIndexes = exports.getFileCodecName = exports.getCodecName = exports.getStreamTypeFlag = exports.getMediaInfoTrack = exports.isSubtitle = exports.isAudio = exports.isVideo = exports.getCodecType = exports.getMediaInfo = void 0;
var IFileObject_1 = require("./interfaces/synced/IFileObject");
// function to execute a MediaInfo scan (if possible) and return a File object with embedded mediaInfo data
var getMediaInfo = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var file;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                file = args.inputFileObj;
                if (!(args.inputFileObj && args.scanIndividualFile)) return [3 /*break*/, 2];
                args.jobLog("scanning file: ".concat(args.inputFileObj._id));
                return [4 /*yield*/, args.scanIndividualFile(args.inputFileObj, {
                        exifToolScan: true,
                        mediaInfoScan: true,
                        closedCaptionScan: false,
                    })];
            case 1:
                file = _a.sent();
                _a.label = 2;
            case 2: return [2 /*return*/, file.mediaInfo];
        }
    });
}); };
exports.getMediaInfo = getMediaInfo;
// function to get the codec type
var getCodecType = function (stream) { var _a, _b; return ((_b = (_a = stream.codec_type) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : ''); };
exports.getCodecType = getCodecType;
// functions to determine key codec types
var isVideo = function (stream) { return (0, exports.getCodecType)(stream) === IFileObject_1.StreamType.video; };
exports.isVideo = isVideo;
var isAudio = function (stream) { return (0, exports.getCodecType)(stream) === IFileObject_1.StreamType.audio; };
exports.isAudio = isAudio;
var isSubtitle = function (stream) { return (0, exports.getCodecType)(stream) === IFileObject_1.StreamType.subtitle; };
exports.isSubtitle = isSubtitle;
// function to get the correct media info track for the input stream - assumes indexes are untouched
var getMediaInfoTrack = function (stream, mediaInfo) {
    var streamIdx = stream.index;
    if (mediaInfo === null || mediaInfo === void 0 ? void 0 : mediaInfo.track) {
        // eslint-disable-next-line no-restricted-syntax
        for (var _i = 0, _a = mediaInfo.track; _i < _a.length; _i++) {
            var infoTrack = _a[_i];
            if (streamIdx === Number(infoTrack.StreamOrder)) {
                return infoTrack;
            }
        }
    }
    return undefined;
};
exports.getMediaInfoTrack = getMediaInfoTrack;
// function to get stream type flag for use in stream specifiers
var getStreamTypeFlag = function (stream) {
    if ((0, exports.isVideo)(stream))
        return 'v';
    if ((0, exports.isAudio)(stream))
        return 'a';
    if ((0, exports.isSubtitle)(stream))
        return 's';
    return '';
};
exports.getStreamTypeFlag = getStreamTypeFlag;
// function to get the codec friendly name
var getCodecName = function (stream, mediaInfoTrack) {
    var _a, _b, _c;
    return ((_b = (_a = mediaInfoTrack === null || mediaInfoTrack === void 0 ? void 0 : mediaInfoTrack.Format_Commercial_IfAny) !== null && _a !== void 0 ? _a : mediaInfoTrack === null || mediaInfoTrack === void 0 ? void 0 : mediaInfoTrack.Format) !== null && _b !== void 0 ? _b : (_c = stream.codec_name) === null || _c === void 0 ? void 0 : _c.toUpperCase());
};
exports.getCodecName = getCodecName;
// map of audio codecs to display names
var audioCodecMap = {
    aac: 'AAC',
    ac3: 'AC3',
    av1: 'AV1',
    dts: 'DTS',
    eac3: 'EAC3',
    flac: 'FLAC',
    mp2: 'MP2',
    mp3: 'MP3',
    mpeg2: 'MPEG2',
    truehd: 'TrueHD',
    'dts-hd ma': 'DTS-HD MA',
    'dts-es': 'DTS-HD ES',
    'dts-hd hra': 'DTS-HD HRA',
    'dts express ': 'DTS Express',
    'dts 96/24': 'DTS',
};
// function to get the codec name for the purposes of renaming files
var getFileCodecName = function (stream, mediaInfoTrack) {
    var _a, _b, _c, _d, _e, _f;
    var codec = String(stream === null || stream === void 0 ? void 0 : stream.codec_name).toLowerCase();
    var profile = (_b = (_a = stream.profile) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : '';
    if ((0, exports.isAudio)(stream)) {
        // handle some special cases
        if (codec === 'dts') {
            if (profile === 'dts-hd ma') {
                return 'DTS-HD MA';
            }
            if (profile.includes('truehd') && profile.includes('atmos')) {
                return 'TrueHD Atmos';
            }
        }
        if (codec === 'eac3') {
            if (profile.includes('atmos')) {
                return 'EAC3 Atmos';
            }
        }
        return audioCodecMap[codec];
    }
    if ((0, exports.isVideo)(stream)) {
        // 265
        if (['hevc', 'x265', 'h265'].includes(codec)) {
            // check if encoder was x265
            if (((_c = mediaInfoTrack === null || mediaInfoTrack === void 0 ? void 0 : mediaInfoTrack.Encoded_Library_Name) === null || _c === void 0 ? void 0 : _c.includes('x265'))
                || ((_d = mediaInfoTrack === null || mediaInfoTrack === void 0 ? void 0 : mediaInfoTrack.Encoded_Library) === null || _d === void 0 ? void 0 : _d.includes('x265'))) {
                return 'x265';
            }
            return 'h265';
        }
        // 264
        if (['avc', 'x264', 'h264'].includes(codec)) {
            // check if encoder was x264
            if (((_e = mediaInfoTrack === null || mediaInfoTrack === void 0 ? void 0 : mediaInfoTrack.Encoded_Library_Name) === null || _e === void 0 ? void 0 : _e.includes('x264'))
                || ((_f = mediaInfoTrack === null || mediaInfoTrack === void 0 ? void 0 : mediaInfoTrack.Encoded_Library) === null || _f === void 0 ? void 0 : _f.includes('x264'))) {
                return 'x264';
            }
            return 'h264';
        }
    }
    return codec;
};
exports.getFileCodecName = getFileCodecName;
// function to set a typeIndex field on each stream in the input array
var setTypeIndexes = function (streams) { return (streams.map(function (stream) { return (0, exports.getCodecType)(stream); })
    .filter(function (value, index, array) { return array.indexOf(value) === index; })
    .forEach(function (typeVal) {
    // for each unique codec type set type index
    streams.filter(function (stream) { return (0, exports.getCodecType)(stream) === typeVal; })
        .forEach(function (stream, index) {
        // eslint-disable-next-line no-param-reassign
        stream.typeIndex = index;
    });
})); };
exports.setTypeIndexes = setTypeIndexes;
// function to get a map of how many streams of each type are present
var getTypeCountsMap = function (streams) { return (streams
    .reduce(function (counts, stream) {
    var _a;
    // eslint-disable-next-line no-param-reassign
    counts[(0, exports.getCodecType)(stream)] = ((_a = counts[(0, exports.getCodecType)(stream)]) !== null && _a !== void 0 ? _a : 0) + 1;
    return counts;
}, {})); };
exports.getTypeCountsMap = getTypeCountsMap;
// map of resolution widths to standard resolution name
var resolutionMap = {
    640: '480p',
    1024: '576p',
    1280: '720p',
    1920: '1080p',
    2560: '1440p',
    3840: '2160p',
    4096: '2160p',
    7680: '4320p',
    8192: '4320p',
};
// function to get the resolution name from a stream
var getResolutionName = function (stream) { return (resolutionMap[Number(stream === null || stream === void 0 ? void 0 : stream.width)]); };
exports.getResolutionName = getResolutionName;
// function to get bitrate from stream
var getBitrate = function (stream, mediaInfoTrack) {
    var _a;
    var bitrate = 0;
    if (mediaInfoTrack === null || mediaInfoTrack === void 0 ? void 0 : mediaInfoTrack.BitRate) {
        // prefer bitrate from mediaInfo
        bitrate = Number(mediaInfoTrack.BitRate);
    }
    else if ((_a = stream.tags) === null || _a === void 0 ? void 0 : _a.BPS) {
        // otherwise fallback to stream data
        bitrate = Number(stream.tags.BPS);
    }
    return bitrate;
};
exports.getBitrate = getBitrate;
// function to get bitrate text from stream
var getBitrateText = function (stream, mediaInfoTrack) {
    var bitrate = (0, exports.getBitrate)(stream, mediaInfoTrack);
    if (bitrate > 0) {
        var kbps = Math.floor(bitrate / 1000);
        if (String(kbps).length > 3) {
            return "".concat((kbps / 1000).toFixed(1), "Mbps");
        }
        return "".concat(kbps, "kbps");
    }
    return undefined;
};
exports.getBitrateText = getBitrateText;
// function to determine if a track is lossless audio
var isLosslessAudio = function (stream, mediaInfoTrack) {
    // if we have media info use it, otherwise assume false
    if ((0, exports.getCodecType)(stream) === 'audio' && (mediaInfoTrack === null || mediaInfoTrack === void 0 ? void 0 : mediaInfoTrack.Compression_Mode)) {
        return Boolean(mediaInfoTrack.Compression_Mode.toLowerCase() === 'lossless');
    }
    return false;
};
exports.isLosslessAudio = isLosslessAudio;
// map of channel count to common user-friendly name
var channelMap = {
    8: '7.1',
    7: '6.1',
    6: '5.1',
    3: '2.1',
    2: '2.0',
    1: '1.0',
};
// function to get the user-friendly channel layout name from a stream
var getChannelsName = function (stream) { return channelMap[Number(stream === null || stream === void 0 ? void 0 : stream.channels)]; };
exports.getChannelsName = getChannelsName;
// function to convert user-friendly channel layout to a number
var getChannelFromName = function (channelName) {
    if (!channelName) {
        return 0;
    }
    return channelName.split('.')
        .map(Number)
        .reduce(function (last, current) { return last + current; }, 0);
};
exports.getChannelFromName = getChannelFromName;
// function to get the sample rate for a file
var getSampleRate = function (stream, mediaInfoTrack) {
    // prefer from media info
    if (mediaInfoTrack === null || mediaInfoTrack === void 0 ? void 0 : mediaInfoTrack.SamplingRate) {
        return Number(mediaInfoTrack.SamplingRate);
    }
    // if unavailable fall back to stream
    if (stream.sample_rate) {
        return Number(stream.sample_rate);
    }
    // if unable to determine return 0
    return 0;
};
exports.getSampleRate = getSampleRate;
// function to get sample rate as text - converted to kHz and returned with units
var getSampleRateText = function (stream, mediaInfoTrack) {
    var sampleRate = (0, exports.getSampleRate)(stream, mediaInfoTrack);
    if (sampleRate > 0) {
        return "".concat(Math.floor(Number(stream.sample_rate) / 1000), "kHz");
    }
    return undefined;
};
exports.getSampleRateText = getSampleRateText;
// function to get the bit depth
var getBitDepth = function (stream, mediaInfoTrack) {
    if (mediaInfoTrack === null || mediaInfoTrack === void 0 ? void 0 : mediaInfoTrack.BitDepth) {
        return Number(mediaInfoTrack.BitDepth);
    }
    if (stream.bits_per_raw_sample) {
        return Number(stream.bits_per_raw_sample);
    }
    return 0;
};
exports.getBitDepth = getBitDepth;
// function to get the bit depth as text
var getBitDepthText = function (stream, mediaInfoTrack) {
    var bitDepth = (0, exports.getBitDepth)(stream, mediaInfoTrack);
    if (bitDepth > 0) {
        return "".concat(bitDepth, "-bit");
    }
    return undefined;
};
exports.getBitDepthText = getBitDepthText;
// map of audio codecs to encoders
var encoderMap = {
    aac: 'aac',
    ac3: 'ac3',
    eac3: 'eac3',
    dts: 'dca',
    flac: 'flac',
    opus: 'libopus',
    mp2: 'mp2',
    mp3: 'libmp3lame',
    truehd: 'truehd',
};
// function to get the audio encoder for a codec
var getEncoder = function (codec) { return encoderMap[String(codec)]; };
exports.getEncoder = getEncoder;
// function to get the title or '' if not set
var getTitle = function (stream) { var _a, _b; return (_b = (_a = stream.tags) === null || _a === void 0 ? void 0 : _a.title) !== null && _b !== void 0 ? _b : ''; };
exports.getTitle = getTitle;
// function to check if a language is undefined
var isLanguageUndefined = function (stream) {
    var _a;
    return (!((_a = stream.tags) === null || _a === void 0 ? void 0 : _a.language) || stream.tags.language === 'und');
};
exports.isLanguageUndefined = isLanguageUndefined;
// function to get the language from a stream with optional support for default value
var getLanguageTag = function (stream, defaultLang) {
    var _a;
    if ((0, exports.isLanguageUndefined)(stream)) {
        return defaultLang !== null && defaultLang !== void 0 ? defaultLang : '';
    }
    return String((_a = stream === null || stream === void 0 ? void 0 : stream.tags) === null || _a === void 0 ? void 0 : _a.language);
};
exports.getLanguageTag = getLanguageTag;
// function to get language name from tag
var languageMap = {
    eng: 'English',
};
var getLanguageName = function (langTag) { return (languageMap[langTag] ? String(languageMap[langTag]) : langTag.toUpperCase()); };
exports.getLanguageName = getLanguageName;
// function to check if a stream language matches one or more language tags
var languageTagAlternates = {
    eng: ['eng', 'en', 'en-us', 'en-gb', 'en-ca', 'en-au'],
    en: ['eng', 'en', 'en-us', 'en-gb', 'en-ca', 'en-au'],
};
var streamMatchesLanguages = function (stream, languageTags, defaultLanguage) {
    // grab the language value with support for optional default
    var streamLanguage = (0, exports.getLanguageTag)(stream, defaultLanguage);
    // create an array with all input tags and all configured alternates
    var allValidTags = __spreadArray(__spreadArray([], languageTags, true), languageTags.flatMap(function (tag) { return (languageTagAlternates[tag]); }), true).filter(function (item) { return item; })
        .filter(function (item, index, items) { return items.indexOf(item) === index; });
    // video streams use 'zxx' to indicate 'no linguistic content' - keep these
    if ((0, exports.isVideo)(stream)) {
        allValidTags.push('zxx');
    }
    // if unable to determine stream language assume no match
    // if able to check for tag equivalents in our map, if none configured check for equality against input
    return Boolean(allValidTags.includes(streamLanguage));
};
exports.streamMatchesLanguages = streamMatchesLanguages;
var streamMatchesLanguage = function (stream, languageTag, defaultLanguage) { return (0, exports.streamMatchesLanguages)(stream, [languageTag], defaultLanguage); };
exports.streamMatchesLanguage = streamMatchesLanguage;
// function to check if a stream appears to be commentary
var hasCommentaryFlag = function (stream) {
    var _a, _b;
    return (((_a = stream.disposition) === null || _a === void 0 ? void 0 : _a.comment) || ((_b = (0, exports.getTitle)(stream).toLowerCase()) === null || _b === void 0 ? void 0 : _b.includes('commentary')));
};
exports.hasCommentaryFlag = hasCommentaryFlag;
// function to check if a stream appears to be descriptive
var hasDescriptiveFlag = function (stream) {
    var _a, _b;
    return (((_a = stream.disposition) === null || _a === void 0 ? void 0 : _a.descriptions)
        || (0, exports.getTitle)(stream).toLowerCase().includes('description')
        || (0, exports.getTitle)(stream).toLowerCase().includes('descriptive')
        || ((_b = stream.disposition) === null || _b === void 0 ? void 0 : _b.visual_impaired)
        || (0, exports.getTitle)(stream).toLowerCase().includes('sdh'));
};
exports.hasDescriptiveFlag = hasDescriptiveFlag;
// function to determine if a stream is standard (not commentary and not descriptive)
var isStandardStream = function (stream) { return (!(0, exports.hasCommentaryFlag)(stream) && !(0, exports.hasDescriptiveFlag)(stream)); };
exports.isStandardStream = isStandardStream;
// function to determine if a stream is commentary but NOT descriptive
var isCommentaryStream = function (stream) { return ((0, exports.hasCommentaryFlag)(stream) && !(0, exports.hasDescriptiveFlag)(stream)); };
exports.isCommentaryStream = isCommentaryStream;
// function to determine if a stream is descriptive
var isDescriptiveStream = function (stream) { return ((0, exports.hasDescriptiveFlag)(stream) && !(0, exports.hasCommentaryFlag)(stream)); };
exports.isDescriptiveStream = isDescriptiveStream;
// function to determine if a stream appears to have both commentary and descriptive properties
var isDescriptiveCommentaryStream = function (stream) { return ((0, exports.hasCommentaryFlag)(stream) && (0, exports.hasDescriptiveFlag)(stream)); };
exports.isDescriptiveCommentaryStream = isDescriptiveCommentaryStream;
// check if a subtitle stream is forced
var isForcedSubtitle = function (stream) {
    var _a, _b;
    return ((0, exports.getCodecType)(stream) === 'subtitle'
        && ((_b = (((_a = stream.disposition) === null || _a === void 0 ? void 0 : _a.forced) === 1 || (0, exports.getTitle)(stream).toLowerCase().includes('forced'))) !== null && _b !== void 0 ? _b : false));
};
exports.isForcedSubtitle = isForcedSubtitle;
// function to get a list of descriptors from an audio track's disposition flags
var getDispositionFlagsText = function (stream) {
    var _a, _b, _c;
    if ((0, exports.isAudio)(stream)) {
        var audioFlags = [
            (((_a = stream.disposition) === null || _a === void 0 ? void 0 : _a.dub) ? 'dub' : undefined),
            ((0, exports.isDescriptiveStream)(stream) ? 'descriptive' : undefined),
            ((0, exports.isCommentaryStream)(stream) ? 'commentary' : undefined),
        ].filter(function (item) { return item; });
        return audioFlags.length > 0 ? "(".concat(audioFlags.join(', '), ")") : null;
    }
    if ((0, exports.isSubtitle)(stream)) {
        var subtitleFlags = [
            (((_b = stream.disposition) === null || _b === void 0 ? void 0 : _b.default) ? 'default' : undefined),
            (((_c = stream.disposition) === null || _c === void 0 ? void 0 : _c.forced) ? 'forced' : undefined),
            ((0, exports.isDescriptiveStream)(stream) ? 'descriptive' : undefined),
            ((0, exports.isCommentaryStream)(stream) ? 'commentary' : undefined),
        ].filter(function (item) { return item; });
        return subtitleFlags.length > 0 ? "(".concat(subtitleFlags.join(', '), ")") : null;
    }
    return null;
};
// function to generate the title for a stream
var generateTitleForStream = function (stream, mediaInfoTrack) {
    var _a;
    if ((0, exports.isVideo)(stream)) {
        return [(_a = stream === null || stream === void 0 ? void 0 : stream.codec_name) === null || _a === void 0 ? void 0 : _a.toUpperCase(), (0, exports.getResolutionName)(stream), (0, exports.getBitrateText)(stream, mediaInfoTrack)]
            .filter(function (item) { return item; }).join(' ');
    }
    if ((0, exports.isAudio)(stream)) {
        return [
            (0, exports.getCodecName)(stream, mediaInfoTrack),
            (0, exports.getChannelsName)(stream),
            (0, exports.getBitrateText)(stream, mediaInfoTrack),
            (0, exports.getSampleRateText)(stream, mediaInfoTrack),
            (0, exports.getBitDepthText)(stream, mediaInfoTrack),
            getDispositionFlagsText(stream),
        ].filter(function (item) { return item; })
            .join(' ');
    }
    if ((0, exports.isSubtitle)(stream)) {
        return [(0, exports.getLanguageName)((0, exports.getLanguageTag)(stream)), getDispositionFlagsText(stream)]
            .filter(function (item) { return item; }).join(' ');
    }
    return '';
};
exports.generateTitleForStream = generateTitleForStream;
// function to get the title and if empty generate one
var getOrGenerateTitle = function (stream, mediaInfoTrack) { return ((0, exports.getTitle)(stream) || (0, exports.generateTitleForStream)(stream, mediaInfoTrack)); };
exports.getOrGenerateTitle = getOrGenerateTitle;
// function to sort streams
// sorts first by codec type - video, audio, subtitle, {other}
// sorts video by resolution (desc), bitrate (desc)
// sorts audio and subtitles by type (standard, commentary, then descriptive)
// sorts audio by then channels (desc), compression type (lossless, lossy), then bitrate (desc)
// sorts subtitles by default, forced, neither
// fallback for all ties and all non-standard codec types is to keep input order (sort by index)
var streamTypeOrder = ['video', 'audio', 'subtitle'];
var getStreamSorter = function (mediaInfo) { return (function (s1, s2) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    // ==== sort first by stream type ==== //
    // get codec type for both streams
    var s1Type = (0, exports.getCodecType)(s1);
    var s2Type = (0, exports.getCodecType)(s2);
    // get index of each, default to 99, we'll tiebreak non-video/audio/subtitle with alphabetic order
    var s1TypeIdx = (_a = streamTypeOrder.indexOf(s1Type)) !== null && _a !== void 0 ? _a : 99;
    var s2TypeIdx = (_b = streamTypeOrder.indexOf(s2Type)) !== null && _b !== void 0 ? _b : 99;
    if (s1TypeIdx < s2TypeIdx)
        return -1;
    if (s1TypeIdx > s2TypeIdx)
        return 1;
    // either codecs are of same type or both entirely unknown
    if (!streamTypeOrder.includes(s1Type) && !streamTypeOrder.includes(s2Type)) {
        // tiebreaker for nonstandard codecs is alphabetic order
        if (s1Type.localeCompare(s2Type) === -1)
            return -1;
        if (s1Type.localeCompare(s2Type) === 1)
            return 1;
    }
    // failsafe to validate type sorting
    if (s1Type !== s2Type) {
        throw new Error("failed to determine sort order for codec types [".concat(s1Type, "] and [").concat(s2Type, "]"));
    }
    // get media info for each track
    var s1MediaInfo = (0, exports.getMediaInfoTrack)(s1, mediaInfo);
    var s2MediaInfo = (0, exports.getMediaInfoTrack)(s2, mediaInfo);
    // ==== tiebreaker for same-type depends on the type ==== //
    if (s1Type === 'video') {
        // resolution descending
        var s1Resolution = Number((_c = s1 === null || s1 === void 0 ? void 0 : s1.width) !== null && _c !== void 0 ? _c : 0);
        var s2Resolution = Number((_d = s2 === null || s2 === void 0 ? void 0 : s2.width) !== null && _d !== void 0 ? _d : 0);
        if (s1Resolution > s2Resolution)
            return -1;
        if (s1Resolution < s2Resolution)
            return 1;
        // then bitrate descending
        var s1VideoBitrate = (0, exports.getBitrate)(s1, s1MediaInfo);
        var s2VideoBitrate = (0, exports.getBitrate)(s2, s2MediaInfo);
        if (s1VideoBitrate > s2VideoBitrate)
            return -1;
        if (s1VideoBitrate < s2VideoBitrate)
            return 1;
        // tie
        return 0;
    }
    if (s1Type === 'audio' || s1Type === 'subtitle') {
        // sort by stream flags -> standard, commentary, descriptive, then commentary+descriptive
        // standard streams (not commentary or descriptive) come before commentary or descriptive
        if ((0, exports.isStandardStream)(s1) && !(0, exports.isStandardStream)(s2))
            return -1;
        if ((0, exports.isStandardStream)(s2) && !(0, exports.isStandardStream)(s1))
            return 1;
        // commentary comes before anything with descriptive flags
        if ((0, exports.isCommentaryStream)(s1) && (0, exports.hasDescriptiveFlag)(s2))
            return -1;
        if ((0, exports.isCommentaryStream)(s2) && (0, exports.hasDescriptiveFlag)(s1))
            return 1;
        // descriptive comes before descriptive commentary
        if ((0, exports.isDescriptiveStream)(s1) && (0, exports.isDescriptiveCommentaryStream)(s2))
            return -1;
        if ((0, exports.isDescriptiveStream)(s2) && (0, exports.isDescriptiveCommentaryStream)(s1))
            return 1;
        // tiebreakers fork on type
        if (s1Type === 'audio') {
            // channels descending
            var s1Channels = Number((_e = s1 === null || s1 === void 0 ? void 0 : s1.channels) !== null && _e !== void 0 ? _e : 0);
            var s2Channels = Number((_f = s2 === null || s2 === void 0 ? void 0 : s2.channels) !== null && _f !== void 0 ? _f : 0);
            if (s1Channels > s2Channels)
                return -1;
            if (s1Channels < s2Channels)
                return 1;
            // lossless before lossy
            var s1Lossless = (0, exports.isLosslessAudio)(s1, s1MediaInfo);
            var s2Lossless = (0, exports.isLosslessAudio)(s2, s2MediaInfo);
            if (s1Lossless && !s2Lossless)
                return -1;
            if (s2Lossless && !s1Lossless)
                return 1;
            // bitrate descending
            var s1AudioBitrate = (0, exports.getBitrate)(s1, s1MediaInfo);
            var s2AudioBitrate = (0, exports.getBitrate)(s2, s2MediaInfo);
            if (s1AudioBitrate > s2AudioBitrate)
                return -1;
            if (s1AudioBitrate < s2AudioBitrate)
                return 1;
        }
        else if (s1Type === 'subtitle') {
            // default flag descending
            var s1Default = Number((_h = (_g = s1 === null || s1 === void 0 ? void 0 : s1.disposition) === null || _g === void 0 ? void 0 : _g.default) !== null && _h !== void 0 ? _h : 0);
            var s2Default = Number((_k = (_j = s2 === null || s2 === void 0 ? void 0 : s2.disposition) === null || _j === void 0 ? void 0 : _j.default) !== null && _k !== void 0 ? _k : 0);
            if (s1Default > s2Default)
                return -1;
            if (s1Default < s2Default)
                return 1;
            // forced flag descending
            var s1Forced = Number((_m = (_l = s1 === null || s1 === void 0 ? void 0 : s1.disposition) === null || _l === void 0 ? void 0 : _l.forced) !== null && _m !== void 0 ? _m : 0);
            var s2Forced = Number((_p = (_o = s2 === null || s2 === void 0 ? void 0 : s2.disposition) === null || _o === void 0 ? void 0 : _o.forced) !== null && _p !== void 0 ? _p : 0);
            if (s1Forced > s2Forced)
                return -1;
            if (s1Forced < s2Forced)
                return 1;
        }
    }
    // if all else is equal fall back input order
    return s1.index - s2.index;
}); };
exports.getStreamSorter = getStreamSorter;

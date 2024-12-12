import { IffmpegCommandStream, IpluginInputArgs } from './interfaces/interfaces';
import {
  IFileObject,
  ImediaInfo,
  ImediaInfoTrack,
  Istreams,
} from './interfaces/synced/IFileObject';

// function to execute a MediaInfo scan (if possible) and return a File object with embedded mediaInfo data
export const getMediaInfo = async (args: IpluginInputArgs): Promise<ImediaInfo | undefined> => {
  let file: IFileObject = args.inputFileObj;
  if (args.inputFileObj && args.scanIndividualFile) {
    args.jobLog(`scanning file: ${args.inputFileObj._id}`);
    file = await args.scanIndividualFile(args.inputFileObj, {
      exifToolScan: true,
      mediaInfoScan: true,
      closedCaptionScan: false,
    });
  }
  return file.mediaInfo;
};

// function to get the codec type
export const getCodecType = (stream: Istreams): string => (stream.codec_type?.toLowerCase() ?? '');

// function to get the correct media info track for the input stream - assumes indexes are untouched
export const getMediaInfoTrack = (stream?: Istreams, mediaInfo?: ImediaInfo): ImediaInfoTrack | undefined => (
  mediaInfo?.track?.filter((infoTrack: ImediaInfoTrack) => (
    infoTrack?.StreamOrder ? Number(infoTrack?.StreamOrder) : -1) === (stream?.index ? Number(stream?.index) : -2))?.[0]
);

// function to get stream type flag for use in stream specifiers
export const getStreamTypeFlag = (stream: IffmpegCommandStream): string => {
  const codecType = getCodecType(stream);
  if (codecType === 'video') return 'v';
  if (codecType === 'audio') return 'a';
  if (codecType === 'subtitle') return 's';
  return '';
};

// function to get the codec friendly name
export const getCodecName = (stream: Istreams, mediaInfoTrack?: ImediaInfoTrack): string => (
  mediaInfoTrack?.Format_Commercial_IfAny ?? mediaInfoTrack?.Format ?? stream.codec_name?.toUpperCase()
);

// function to get video codec name for rename purposes
// map of audio codecs to display names
const audioCodecMap: { [key: string]: string } = {
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
export const getFileCodecName = (stream: Istreams, mediaInfoTrack?: ImediaInfoTrack): string => {
  const codecType: string = getCodecType(stream);
  const codec: string = String(stream?.codec_name).toLowerCase();
  const profile: string = stream.profile?.toLowerCase() ?? '';
  if (codecType === 'audio') {
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
  if (codecType === 'video') {
    if (['hevc', 'x265', 'h265'].includes(codec)) {
      // 265
      // check if encoder was x265
      if (mediaInfoTrack?.Encoded_Library_Name === 'x265') {
        return 'x265';
      }
      return 'h265';
    }
    if (['avc', 'x264', 'h264'].includes(codec)) {
      // 264
      // check if encoder was x265
      if (mediaInfoTrack?.Encoded_Library_Name === 'x264') {
        return 'x264';
      }
      return 'h264';
    }
  }
  return codec;
};

// function to set a typeIndex field on each stream in the input array
export const setTypeIndexes = (streams: IffmpegCommandStream[]): void => (
  streams.map((stream) => getCodecType(stream))
    .filter((value, index, array) => array.indexOf(value) === index)
    .forEach((codecType) => {
      // for each unique codec type set type index
      streams.filter((stream) => getCodecType(stream) === codecType)
        .forEach((stream, index) => {
          // eslint-disable-next-line no-param-reassign
          stream.typeIndex = index;
        });
    }));

// function to get a map of how many streams of each type are present
export const getTypeCountsMap = (streams: IffmpegCommandStream[]): { [key: string]: number } => (
  streams
    .reduce((counts: { [key: string]: number }, stream: IffmpegCommandStream) => {
      // eslint-disable-next-line no-param-reassign
      counts[getCodecType(stream)] = (counts[getCodecType(stream)] ?? 0) + 1;
      return counts;
    }, {})
);

// map of resolution widths to standard resolution name
const resolutionMap: { [key: number]: string } = {
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
export const getResolutionName = (stream?: Istreams): string => (resolutionMap[Number(stream?.width)]);

// function to get bitrate from stream
export const getBitrate = (stream: IffmpegCommandStream, mediaInfoTrack?: ImediaInfoTrack): number => {
  let bitrate = 0;
  if (mediaInfoTrack?.BitRate) {
    // prefer bitrate from mediaInfo
    bitrate = Number(mediaInfoTrack.BitRate);
  } else if (stream.tags?.BPS) {
    // otherwise fallback to stream data
    bitrate = Number(stream.tags.BPS);
  }
  return bitrate;
};

// function to get bitrate text from stream
export const getBitrateText = (stream: IffmpegCommandStream, mediaInfoTrack?: ImediaInfoTrack): string | undefined => {
  const bitrate = getBitrate(stream, mediaInfoTrack);
  if (bitrate > 0) {
    const kbps: number = Math.floor(bitrate / 1000);
    if (String(kbps).length > 3) {
      return `${(kbps / 1000).toFixed(1)}Mbps`;
    }
    return `${kbps}kbps`;
  }
  return undefined;
};

// function to determine if a track is lossless audio
export const isLosslessAudio = (stream: IffmpegCommandStream, mediaInfoTrack?: ImediaInfoTrack): boolean => {
  // if we have media info use it, otherwise assume false
  if (getCodecType(stream) === 'audio' && mediaInfoTrack?.Compression_Mode) {
    return Boolean(mediaInfoTrack.Compression_Mode.toLowerCase() === 'lossless');
  }
  return false;
};

// map of channel count to common user-friendly name
const channelMap: { [key: string]: string } = {
  8: '7.1',
  7: '6.1',
  6: '5.1',
  3: '2.1',
  2: '2.0',
  1: '1.0',
};

// function to get the user-friendly channel layout name from a stream
export const getChannelsName = (stream?: Istreams): string => channelMap[Number(stream?.channels)];

// function to convert user-friendly channel layout to a number
export const getChannelCount = (channelName: string): number => {
  if (!channelName) {
    return 0;
  }
  return channelName.split('.')
    .map(Number)
    .reduce((last, current) => last + current, 0);
};

// function to get the sample rate for a file
export const getSampleRate = (stream: IffmpegCommandStream, mediaInfoTrack?: ImediaInfoTrack): number => {
  // prefer from media info
  if (mediaInfoTrack?.SamplingRate) {
    return Number(mediaInfoTrack.SamplingRate);
  }
  // if unavailable fall back to stream
  if (stream.sample_rate) {
    return Number(stream.sample_rate);
  }
  // if unable to determine return 0
  return 0;
};

// function to get sample rate as text - converted to kHz and returned with units
export const getSampleRateText = (
  stream: IffmpegCommandStream, mediaInfoTrack?: ImediaInfoTrack,
): string | undefined => {
  const sampleRate = getSampleRate(stream, mediaInfoTrack);
  if (sampleRate > 0) {
    return `${Math.floor(Number(stream.sample_rate) / 1000)}kHz`;
  }
  return undefined;
};

// function to get the bit depth
export const getBitDepth = (stream: IffmpegCommandStream, mediaInfoTrack?: ImediaInfoTrack): number => {
  if (mediaInfoTrack?.BitDepth) {
    return Number(mediaInfoTrack.BitDepth);
  }
  if (stream.bits_per_raw_sample) {
    return Number(stream.bits_per_raw_sample);
  }
  return 0;
};

// function to get the bit depth as text
export const getBitDepthText = (stream: IffmpegCommandStream, mediaInfoTrack?: ImediaInfoTrack): string | undefined => {
  const bitDepth = getBitDepth(stream, mediaInfoTrack);
  if (bitDepth > 0) {
    return `${bitDepth}-bit`;
  }
  return undefined;
};

// map of audio codecs to encoders
const encoderMap: { [key: string]: string } = {
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
export const getEncoder = (codec: string): string => encoderMap[String(codec)];

// function to check if a language is undefined
export const isLanguageUndefined = (stream: IffmpegCommandStream): boolean => (
  !stream.tags?.language || stream.tags.language === 'und'
);

// function to get the language from a stream with optional support for default value
export const getLanguageTag = (stream: IffmpegCommandStream, defaultLang?: string): string => {
  if (isLanguageUndefined(stream)) {
    return defaultLang ?? '';
  }
  return String(stream?.tags?.language);
};

// map language tags to language name
const languageMap: { [key: string]: string } = {
  eng: 'English',
};

// function to get language name from tag
export const getLanguageName = (langTag: string): string => (
  languageMap[langTag] ? String(languageMap[langTag]) : langTag.toUpperCase()
);

// map of language tag alternates
const languageTagAlternates: { [key: string]: string[] } = {
  eng: ['eng', 'en', 'en-us', 'en-gb', 'en-ca', 'en-au'],
};

// function to check if a stream language matches one of a list of tags with support for defaulting undefined
export const streamMatchesLanguages = (
  stream: IffmpegCommandStream, languageTags: string[], defaultLanguage?: string,
): boolean => {
  // grab the language value with support for optional default
  const streamLanguage = getLanguageTag(stream, defaultLanguage);
  // create an array with all input tags and all configured alternates
  const allValidTags = [...languageTags, ...languageTags.flatMap((tag: string) => (languageTagAlternates[tag]))]
    .filter((item) => item)
    .filter((item: string, index: number, items: string[]) => items.indexOf(item) === index);
  // if unable to determine stream language assume no match
  // if able to check for tag equivalents in our map, if none configured check for equality against input
  return Boolean(streamLanguage && allValidTags.includes(streamLanguage));
};

// function to check if a stream matches a single language tag
export const streamMatchesLanguage = (
  stream: IffmpegCommandStream, languageTag: string, defaultLanguage?: string,
): boolean => streamMatchesLanguages(stream, [languageTag], defaultLanguage);

// function to check if a stream appears to be commentary
export const streamHasCommentary = (stream: IffmpegCommandStream): boolean => (
  stream.disposition?.comment
  || stream.tags?.title?.toLowerCase()
    ?.includes('commentary')
);

// function to check if a stream appears to be descriptive
export const streamHasDescriptive = (stream: IffmpegCommandStream): boolean => (
  stream.disposition?.descriptions
  || stream.tags?.title?.toLowerCase()
    ?.includes('description')
  || stream.tags?.title?.toLowerCase()
    ?.includes('descriptive')
  || stream.disposition?.visual_impaired
  || stream.tags?.title?.toLowerCase()
    ?.includes('sdh')
);

// function to determine if a stream is standard (not commentary and not descriptive)
export const streamIsStandard = (stream: IffmpegCommandStream): boolean => (
  !streamHasCommentary(stream) && !streamHasDescriptive(stream)
);

// function to determine if a stream is commentary but NOT descriptive
export const streamIsCommentary = (stream: IffmpegCommandStream): boolean => (
  streamHasCommentary(stream) && !streamHasDescriptive(stream)
);

// function to determine if a stream is descriptive
export const streamIsDescriptive = (stream: IffmpegCommandStream): boolean => (
  streamHasDescriptive(stream) && !streamHasCommentary(stream)
);

// function to determine if a stream appears to have both commentary and descriptive properties
export const streamIsDescriptiveCommentary = (stream: IffmpegCommandStream): boolean => (
  streamHasCommentary(stream) && streamHasDescriptive(stream)
);

// function to get a list of descriptors from an audio track's disposition flags
const getDispositionFlagsText = (stream: IffmpegCommandStream): string | null => {
  const codecType = getCodecType(stream);
  if (codecType === 'audio') {
    const audioFlags = [
      (stream.disposition?.dub ? 'dub' : undefined),
      (streamIsDescriptive(stream) ? 'descriptive' : undefined),
      (streamIsCommentary(stream) ? 'commentary' : undefined),
    ].filter((item) => item);
    return audioFlags.length > 0 ? `(${audioFlags.join(', ')})` : null;
  }
  if (codecType === 'subtitle') {
    const subtitleFlags = [
      (stream.disposition?.default ? 'default' : undefined),
      (stream.disposition?.forced ? 'forced' : undefined),
      (streamIsDescriptive(stream) ? 'descriptive' : undefined),
      (streamIsCommentary(stream) ? 'commentary' : undefined),
    ].filter((item) => item);
    return subtitleFlags.length > 0 ? `(${subtitleFlags.join(', ')})` : null;
  }
  return null;
};

// function to generate the title for a stream
export const generateTitleForStream = (stream: IffmpegCommandStream, mediaInfoTrack?: ImediaInfoTrack): string => {
  const codecType = getCodecType(stream);
  switch (codecType) {
    case 'video':
      return [stream?.codec_name?.toUpperCase(), getResolutionName(stream), getBitrateText(stream, mediaInfoTrack)]
        .filter((item) => item).join(' ');
    case 'audio':
      return [
        getCodecName(stream, mediaInfoTrack),
        getChannelsName(stream),
        getBitrateText(stream, mediaInfoTrack),
        getSampleRateText(stream, mediaInfoTrack),
        getBitDepthText(stream, mediaInfoTrack),
        getDispositionFlagsText(stream),
      ].filter((item) => item)
        .join(' ');
    case 'subtitle':
      return [getLanguageName(getLanguageTag(stream)), getDispositionFlagsText(stream)]
        .filter((item) => item).join(' ');
    default:
      return '';
  }
};

// function to get the title and if undefined generate one
export const getTitleForStream = (stream: IffmpegCommandStream, mediaInfoTrack?: ImediaInfoTrack): string => {
  if (stream.tags?.title) {
    return stream.tags.title;
  }
  return generateTitleForStream(stream, mediaInfoTrack);
};

// function to sort streams
// sorts first by codec type - video, audio, subtitle, {other}
// sorts video by resolution (desc), bitrate (desc)
// sorts audio and subtitles by type (standard, commentary, then descriptive)
// sorts audio by then channels (desc), compression type (lossless, lossy), then bitrate (desc)
// sorts subtitles by default, forced, neither
// fallback for all ties and all non-standard codec types is to keep input order (sort by index)
const streamTypeOrder: string[] = ['video', 'audio', 'subtitle'];
export const getStreamSorter = (mediaInfo?: ImediaInfo): (
  (s1: IffmpegCommandStream, s2: IffmpegCommandStream) => number) => (
  (s1: IffmpegCommandStream, s2: IffmpegCommandStream): number => {
    // ==== sort first by stream type ==== //
    // get codec type for both streams
    const s1Type: string = getCodecType(s1);
    const s2Type: string = getCodecType(s2);
    // get index of each, default to 99, we'll tiebreak non-video/audio/subtitle with alphabetic order
    const s1TypeIdx: number = streamTypeOrder.indexOf(s1Type) ?? 99;
    const s2TypeIdx: number = streamTypeOrder.indexOf(s2Type) ?? 99;
    if (s1TypeIdx < s2TypeIdx) return -1;
    if (s1TypeIdx > s2TypeIdx) return 1;
    // either codecs are of same type or both entirely unknown
    if (!streamTypeOrder.includes(s1Type) && !streamTypeOrder.includes(s2Type)) {
      // tiebreaker for nonstandard codecs is alphabetic order
      if (s1Type.localeCompare(s2Type) === -1) return -1;
      if (s1Type.localeCompare(s2Type) === 1) return 1;
    }
    // failsafe to validate type sorting
    if (s1Type !== s2Type) {
      throw new Error(`failed to determine sort order for codec types [${s1Type}] and [${s2Type}]`);
    }
    // get media info for each track
    const s1MediaInfo = getMediaInfoTrack(s1, mediaInfo);
    const s2MediaInfo = getMediaInfoTrack(s2, mediaInfo);
    // ==== tiebreaker for same-type depends on the type ==== //
    if (s1Type === 'video') {
      // resolution descending
      const s1Resolution = Number(s1?.width ?? 0);
      const s2Resolution = Number(s2?.width ?? 0);
      if (s1Resolution > s2Resolution) return -1;
      if (s1Resolution < s2Resolution) return 1;
      // then bitrate descending
      const s1VideoBitrate = getBitrate(s1, s1MediaInfo);
      const s2VideoBitrate = getBitrate(s2, s2MediaInfo);
      if (s1VideoBitrate > s2VideoBitrate) return -1;
      if (s1VideoBitrate < s2VideoBitrate) return 1;
      // tie
      return 0;
    }
    if (s1Type === 'audio' || s1Type === 'subtitle') {
      // sort by stream flags -> standard, commentary, descriptive, then commentary+descriptive
      // standard streams (not commentary or descriptive) come before commentary or descriptive
      if (streamIsStandard(s1) && !streamIsStandard(s2)) return -1;
      if (streamIsStandard(s2) && !streamIsStandard(s1)) return 1;
      // commentary comes before anything with descriptive flags
      if (streamIsCommentary(s1) && streamHasDescriptive(s2)) return -1;
      if (streamIsCommentary(s2) && streamHasDescriptive(s1)) return 1;
      // descriptive comes before descriptive commentary
      if (streamIsDescriptive(s1) && streamIsDescriptiveCommentary(s2)) return -1;
      if (streamIsDescriptive(s2) && streamIsDescriptiveCommentary(s1)) return 1;
      // tiebreakers fork on type
      if (s1Type === 'audio') {
        // channels descending
        const s1Channels = Number(s1?.channels ?? 0);
        const s2Channels = Number(s2?.channels ?? 0);
        if (s1Channels > s2Channels) return -1;
        if (s1Channels < s2Channels) return 1;
        // lossless before lossy
        const s1Lossless = isLosslessAudio(s1, s1MediaInfo);
        const s2Lossless = isLosslessAudio(s2, s2MediaInfo);
        if (s1Lossless && !s2Lossless) return -1;
        if (s2Lossless && !s1Lossless) return 1;
        // bitrate descending
        const s1AudioBitrate = getBitrate(s1, s1MediaInfo);
        const s2AudioBitrate = getBitrate(s2, s2MediaInfo);
        if (s1AudioBitrate > s2AudioBitrate) return -1;
        if (s1AudioBitrate < s2AudioBitrate) return 1;
      } else if (s1Type === 'subtitle') {
        // default flag descending
        const s1Default = Number(s1?.disposition?.default ?? 0);
        const s2Default = Number(s2?.disposition?.default ?? 0);
        if (s1Default > s2Default) return -1;
        if (s1Default < s2Default) return 1;
        // forced flag descending
        const s1Forced = Number(s1?.disposition?.forced ?? 0);
        const s2Forced = Number(s2?.disposition?.forced ?? 0);
        if (s1Forced > s2Forced) return -1;
        if (s1Forced < s2Forced) return 1;
      }
    }
    // if all else is equal fall back input order
    return s1.index - s2.index;
  }
);
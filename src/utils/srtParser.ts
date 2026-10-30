/**
 * Subtitle Edit SRT Parser & Lyric Sync Utility
 * Parses .srt files into structured, reactive cue arrays with second-level timestamps.
 */

export interface LyricCue {
  time: number; // floating-point seconds (e.g. 2.0, 5.801)
  endTime?: number; // floating-point seconds (e.g. 5.777)
  text: string; // grouped and trimmed multi-line text
}

/**
 * Converts Subtitle Edit SRT timestamp formats (HH:MM:SS,mmm or HH:MM:SS.mmm)
 * into floating-point seconds.
 * Examples:
 *   "00:00:02,000" -> 2.0
 *   "00:00:05,801" -> 5.801
 *   "00:01:20,049" -> 80.049
 */
export function srtTimeToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  const trimmed = timeStr.trim();

  // Standard SRT format: 00:00:05,801 or 00:00:05.801
  const match = trimmed.match(/^(\d{2}):(\d{2}):(\d{2})[,.](\d{3})$/);
  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = parseInt(match[3], 10);
    const millis = parseInt(match[4], 10);
    return Math.round((hours * 3600 + minutes * 60 + seconds + millis / 1000) * 1000) / 1000;
  }

  // Fallback for flexible/loose timestamp formats
  const parts = trimmed.split(/[:,.]/);
  if (parts.length >= 3) {
    const hours = parseFloat(parts[0]) || 0;
    const minutes = parseFloat(parts[1]) || 0;
    const seconds = parseFloat(parts[2]) || 0;
    const millis = parts[3] ? parseFloat(parts[3]) / 1000 : 0;
    return Math.round((hours * 3600 + minutes * 60 + seconds + millis) * 1000) / 1000;
  }

  return 0;
}

/**
 * Parses raw SRT string content into a sorted array of LyricCue objects.
 * - Groups multi-line subtitle text per cue into a clean single string.
 * - Filters HTML formatting tags and subtitle artifacts like [BLANK_AUDIO].
 * - Automatically prepends an atmospheric intro line if the first vocal begins after 1.5s.
 */
export function parseSRT(rawSrt: string): LyricCue[] {
  if (!rawSrt || typeof rawSrt !== 'string') return [];

  // Normalize line endings to \n
  const normalized = rawSrt.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  // Split into individual cue blocks separated by blank lines
  const blocks = normalized.split(/\n\s*\n+/);
  const cues: LyricCue[] = [];

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length === 0) continue;

    // Detect if line 0 is numeric index (1, 2, 3...)
    let timeLineIdx = 0;
    if (/^\d+$/.test(lines[0]) && lines.length > 1) {
      timeLineIdx = 1;
    }

    const timeLine = lines[timeLineIdx];
    if (!timeLine || !timeLine.includes('-->')) continue;

    const [startRaw, endRaw] = timeLine.split('-->');
    if (!startRaw) continue;

    const startTime = srtTimeToSeconds(startRaw);
    const endTime = endRaw ? srtTimeToSeconds(endRaw) : undefined;

    // Group all following lines into a single clean text string
    const textLines = lines.slice(timeLineIdx + 1);
    let cleanText = textLines
      .join(' ')
      .replace(/<[^>]*>/g, '') // strip HTML tags
      .replace(/\s+/g, ' ') // collapse multi-spaces
      .trim();

    // Filter empty lines or audio markers like [BLANK_AUDIO] or [Music]
    if (!cleanText || /^\[.*\]$/.test(cleanText) || cleanText.toUpperCase() === '[BLANK_AUDIO]') {
      continue;
    }

    cues.push({
      time: startTime,
      endTime,
      text: cleanText,
    });
  }

  // Ensure chronological order
  cues.sort((a, b) => a.time - b.time);

  // If first vocal cue begins after 1.5s, prepend an atmospheric musical prelude
  if (cues.length > 0 && cues[0].time > 1.5) {
    cues.unshift({
      time: 0.0,
      endTime: cues[0].time,
      text: '♪ • • •',
    });
  }

  return cues;
}

// In-memory cache to prevent duplicate network fetches
const srtCache = new Map<string, LyricCue[]>();

/**
 * Asynchronously fetches and parses an SRT file from the given path (e.g., '/song.srt').
 * Results are cached in memory.
 */
export async function loadSRT(url: string): Promise<LyricCue[]> {
  if (!url) return [];

  if (srtCache.has(url)) {
    return srtCache.get(url)!;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch SRT from ${url} (status: ${response.status})`);
    }
    const text = await response.text();
    const cues = parseSRT(text);
    srtCache.set(url, cues);
    return cues;
  } catch (error) {
    console.warn(`[SRT Parser] Could not load or parse SRT at ${url}:`, error);
    return [];
  }
}

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { SONGS, DEFAULT_SONG_ID, type LyricLine } from '../types';
import { soundManager } from '../utils/audio';
import { loadSRT, type LyricCue } from '../utils/srtParser';

interface FloatingLyricsProps {
  songId?: string;
  visible?: boolean;
}

export const FloatingLyrics: React.FC<FloatingLyricsProps> = ({
  songId = DEFAULT_SONG_ID,
  visible = true,
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const lastTimeRef = useRef<number>(0);

  const song = useMemo(() => {
    return SONGS.find((s) => s.id === songId) || SONGS[0];
  }, [songId]);

  // Reactive synced lyrics array (populated from SRT file or static fallback)
  const [lyricsList, setLyricsList] = useState<LyricLine[]>(() => song.lyrics || []);

  // Asynchronously fetch and parse Subtitle Edit SRT file on track change or initial mount
  useEffect(() => {
    let isCancelled = false;

    // Cleanly reset playback time and active cue index to 0 whenever track changes
    setCurrentTime(0);
    lastTimeRef.current = 0;
    if (song.lyrics) {
      setLyricsList(song.lyrics);
    } else {
      setLyricsList([{ time: 0, text: '♪ • • •' }]);
    }

    if (song.srt) {
      loadSRT(song.srt)
        .then((parsedCues: LyricCue[]) => {
          if (!isCancelled && parsedCues && parsedCues.length > 0) {
            setLyricsList(parsedCues);
          }
        })
        .catch((err) => {
          console.warn('[FloatingLyrics] Error loading SRT, using static fallback:', err);
          if (!isCancelled && song.lyrics) {
            setLyricsList(song.lyrics);
          }
        });
    } else if (song.lyrics) {
      setLyricsList(song.lyrics);
    }

    return () => {
      isCancelled = true;
    };
  }, [song]);

  // Subscribe to fine-tuned audio timeupdate listener with loop/restart detection
  useEffect(() => {
    const unsubscribe = soundManager.onTimeUpdate((time) => {
      // Audio Loop / Restart Detection: if playback jumped backwards significantly
      if (lastTimeRef.current > 1.0 && time < 0.5) {
        setCurrentTime(0);
      } else {
        setCurrentTime(time);
      }
      lastTimeRef.current = time;
    });
    return unsubscribe;
  }, []);

  // Compute active lyric index based on audio.currentTime
  const activeIndex = useMemo(() => {
    if (!lyricsList.length) return 0;

    let idx = 0;
    for (let i = 0; i < lyricsList.length; i++) {
      if (currentTime >= lyricsList[i].time) {
        idx = i;
      } else {
        break;
      }
    }
    return idx;
  }, [lyricsList, currentTime]);

  const prevLine = activeIndex > 0 ? lyricsList[activeIndex - 1] : null;
  const currentLine = lyricsList[activeIndex] || lyricsList[0] || { time: 0, text: '♪ • • •' };
  const nextLine = activeIndex + 1 < lyricsList.length ? lyricsList[activeIndex + 1] : null;

  return (
    <div
      id="lyrics-container"
      className={`lyrics-floating-container transition-opacity duration-500 ease-out ${
        visible ? 'opacity-100 pointer-events-none' : 'opacity-0 pointer-events-none'
      }`}
      aria-live="polite"
    >
      {/* Subtle Romantic Melody Accent */}
      <div className="lyrics-melody-title">
        <svg
          className="w-3.5 h-3.5 inline-block mr-1.5 flex-shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--theme-primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
        <span>{song.title}</span>
      </div>

      {/* Previous Lyric Line (fading upward) */}
      <div className="lyric-line-prev">
        {prevLine ? prevLine.text : '\u00A0'}
      </div>

      {/* Active Lyric Line (popping in with starlight glow) */}
      <div key={`${song.id}-${activeIndex}`} className="lyric-line-active">
        {currentLine.text}
      </div>

      {/* Next Lyric Preview (subtle below) */}
      <div className="lyric-line-next">
        {nextLine ? nextLine.text : '\u00A0'}
      </div>
    </div>
  );
};

export default FloatingLyrics;

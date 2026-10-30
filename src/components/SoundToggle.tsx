import React, { useState, useEffect } from 'react';
import { soundManager } from '../utils/audio';

export const SoundToggle: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(() => soundManager.isPlaying());
  const [volume, setVolume] = useState(() => Math.round(soundManager.getVolume() * 100));

  useEffect(() => {
    const unsubState = soundManager.onStateChange((playing) => {
      setIsPlaying(playing);
      if (!playing) {
        setVolume(0);
      } else {
        setVolume(Math.round(soundManager.getVolume() * 100));
      }
    });

    const unsubVolume = soundManager.onVolumeChange((vol) => {
      setVolume(Math.round(vol * 100));
    });

    return () => {
      unsubState();
      unsubVolume();
    };
  }, []);

  const handleToggle = () => {
    soundManager.toggle();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement> | React.FormEvent<HTMLInputElement>) => {
    const newVol = parseInt(e.currentTarget.value, 10);
    setVolume(newVol);
    soundManager.setVolume(newVol / 100);
  };

  const isMuted = !isPlaying || volume === 0;
  const currentPercent = isMuted ? 0 : volume;

  return (
    <div
      className="celestial-audio-pill"
      role="region"
      aria-label="Cosmic sound controls"
    >
      {/* Mute / Unmute Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="celestial-audio-icon-btn"
        title={isMuted ? 'Unmute ambient sound' : 'Mute ambient sound'}
        aria-label={isMuted ? 'Unmute ambient sound' : 'Mute ambient sound'}
      >
        {isMuted ? (
          /* Muted: Speaker cone with elegant diagonal slash (VolumeX) */
          <svg
            className="w-[17px] h-[17px] transition-transform duration-200"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255, 255, 255, 0.75)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="22" y1="2" x2="2" y2="22" stroke="rgba(255, 255, 255, 0.85)" strokeWidth="1.8" />
          </svg>
        ) : (
          /* Unmuted: Speaker cone with radiating sound wave arcs */
          <svg
            className="w-[17px] h-[17px] transition-transform duration-200"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255, 255, 255, 0.9)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path
              d="M15.5 8.5a5 5 0 0 1 0 7"
              stroke="var(--theme-primary, #38bdf8)"
              className="animate-pulse"
            />
            {currentPercent > 50 && (
              <path
                d="M19 5a9.5 9.5 0 0 1 0 14"
                stroke="var(--theme-accent, #818cf8)"
              />
            )}
          </svg>
        )}
      </button>

      {/* Smooth, Compact Volume Slider (0 to 100%) */}
      <div className="flex items-center gap-1.5">
        <input
          type="range"
          min="0"
          max="100"
          value={currentPercent}
          onChange={handleVolumeChange}
          onInput={handleVolumeChange}
          className="celestial-volume-slider"
          aria-label="Volume slider"
          aria-valuenow={currentPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          title={`Volume: ${currentPercent}%`}
          style={{
            background: `linear-gradient(to right, var(--theme-primary, #38bdf8) 0%, var(--theme-primary, #38bdf8) ${currentPercent}%, rgba(255, 255, 255, 0.16) ${currentPercent}%, rgba(255, 255, 255, 0.16) 100%)`,
          }}
        />
        <span
          className="text-[10px] font-mono text-slate-300/80 w-[26px] text-right select-none pointer-events-none tabular-nums"
          aria-hidden="true"
        >
          {currentPercent}%
        </span>
      </div>
    </div>
  );
};

export default SoundToggle;

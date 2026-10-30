import React, { useState, useEffect } from 'react';
import { soundManager } from '../utils/audio';

export const SoundToggle: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const unsubscribe = soundManager.onStateChange((playing) => {
      setIsPlaying(playing);
    });
    return unsubscribe;
  }, []);

  const handleToggle = () => {
    soundManager.toggle();
  };

  return (
    <button
      onClick={handleToggle}
      className="celestial-audio-btn"
      title={isPlaying ? 'Mute ambient sound' : 'Play dreamy ambient celestial sound'}
      aria-label={isPlaying ? 'Mute ambient sound' : 'Play dreamy ambient celestial sound'}
    >
      {isPlaying ? (
        /* Unmuted: Speaker cone with radiating sound arcs */
        <svg
          className="w-[18px] h-[18px] transition-transform duration-200"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255, 255, 255, 0.85)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Speaker Cone */}
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          {/* Radiating Sound Arcs */}
          <path d="M15.5 8.5a5 5 0 0 1 0 7" stroke="rgba(56, 189, 248, 0.9)" />
          <path d="M19 5a9.5 9.5 0 0 1 0 14" stroke="rgba(129, 140, 248, 0.85)" />
        </svg>
      ) : (
        /* Muted: Speaker cone with elegant diagonal slash */
        <svg
          className="w-[18px] h-[18px] transition-transform duration-200"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255, 255, 255, 0.85)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Speaker Cone */}
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          {/* Elegant Diagonal Slash */}
          <line x1="22" y1="2" x2="2" y2="22" stroke="rgba(255, 255, 255, 0.85)" strokeWidth="1.8" />
        </svg>
      )}
    </button>
  );
};

export default SoundToggle;

import React, { useState, useEffect } from 'react';
import { Sparkles, MessageSquareHeart, ChevronDown, Check, X } from 'lucide-react';
import {
  DEFAULT_ROMANTIC_MESSAGE,
  COSMIC_THEMES,
  SONGS,
  DEFAULT_SONG_ID,
  type CosmicThemeId,
  type PersonalizationData,
} from '../types';
import { soundManager } from '../utils/audio';

interface OpeningScreenProps {
  initialData?: PersonalizationData;
  onSubmit: (data: PersonalizationData) => void;
  canReturnToHeart?: boolean;
  onReturnToHeart?: () => void;
  isModal?: boolean;
  onCloseModal?: () => void;
  onThemePreview?: (theme: CosmicThemeId) => void;
}

export const OpeningScreen: React.FC<OpeningScreenProps> = ({
  initialData,
  onSubmit,
  canReturnToHeart = false,
  onReturnToHeart,
  isModal = false,
  onCloseModal,
  onThemePreview,
}) => {
  const [fromName, setFromName] = useState(initialData?.fromName || '');
  const [toName, setToName] = useState(initialData?.toName || '');
  const [message, setMessage] = useState(initialData?.message || DEFAULT_ROMANTIC_MESSAGE);
  const [selectedTheme, setSelectedTheme] = useState<CosmicThemeId>(initialData?.theme || 'blue');
  const [selectedSong, setSelectedSong] = useState<string>(initialData?.song || DEFAULT_SONG_ID);
  const [showMessageEdit, setShowMessageEdit] = useState(
    Boolean(initialData?.message && initialData.message.trim() !== DEFAULT_ROMANTIC_MESSAGE.trim())
  );
  const [error, setError] = useState<string | null>(null);

  // Sync state if initialData changes (e.g. when opening from "Create Another Heart")
  useEffect(() => {
    if (initialData?.fromName !== undefined) setFromName(initialData.fromName);
    if (initialData?.toName !== undefined) setToName(initialData.toName);
    if (initialData?.message !== undefined) setMessage(initialData.message);
    if (initialData?.theme !== undefined) {
      setSelectedTheme(initialData.theme);
      document.documentElement.setAttribute('data-theme', initialData.theme);
    }
    if (initialData?.song !== undefined) {
      setSelectedSong(initialData.song);
    }
  }, [initialData?.fromName, initialData?.toName, initialData?.message, initialData?.theme, initialData?.song]);

  const handleThemeSelect = (themeId: CosmicThemeId) => {
    setSelectedTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    if (onThemePreview) {
      onThemePreview(themeId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanFrom = fromName.trim().slice(0, 30);
    const cleanTo = toName.trim().slice(0, 30);
    const cleanMsg = message.trim();

    if (!cleanFrom) {
      setError('Please enter your name');
      return;
    }
    if (!cleanTo) {
      setError("Please enter someone special's name");
      return;
    }

    setError(null);
    onSubmit({
      fromName: cleanFrom,
      toName: cleanTo,
      message: cleanMsg || DEFAULT_ROMANTIC_MESSAGE,
      theme: selectedTheme,
      song: selectedSong,
    });
  };

  const handleReturn = onReturnToHeart || onCloseModal;

  return (
    <div
      data-theme={selectedTheme}
      className="relative z-30 flex items-center justify-center w-full h-full p-3 sm:p-5 select-none bg-transparent"
    >
      {/* --- Cosmic Soft Atmosphere --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft atmospheric nebula radial glows (optimized 36px-48px blurs for 60 FPS mobile performance) */}
        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[400px] bg-indigo-900/15 rounded-full blur-[48px]" />
        <div className="absolute bottom-[20%] left-[25%] w-[450px] h-[300px] bg-blue-950/20 rounded-full blur-[36px]" />
        <div className="absolute top-[60%] right-[20%] w-[400px] h-[320px] bg-violet-950/15 rounded-full blur-[36px]" />
      </div>

      {/* --- Frosted Glassmorphism Card Container --- */}
      <div className="relative z-10 w-full max-w-[480px] mx-auto flex flex-col items-center">
        {/* Layered Atmospheric Ambient Backlight Aura (Optimized hardware-accelerated instant color response) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] pointer-events-none -z-10 animate-aura-pulse">
          <div
            className="cosmic-ambient-aura absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[460px] rounded-full blur-[48px]"
            style={{ backgroundColor: COSMIC_THEMES[selectedTheme].bgCenter }}
          />
          <div
            className="cosmic-ambient-aura absolute top-[46%] left-[54%] -translate-x-1/2 -translate-y-1/2 w-[400px] h-[360px] rounded-full blur-[36px]"
            style={{ backgroundColor: COSMIC_THEMES[selectedTheme].bgMist }}
          />
        </div>

        {/* Return to Heart Button: Positioned in safe top action bar with clear separation from browser bar and header badge */}
        {canReturnToHeart && handleReturn && (
          <div className="w-full flex justify-end mb-2 pr-1">
            <button
              type="button"
              onClick={handleReturn}
              className="text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5 cursor-pointer rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/20 hover:border-white/35 backdrop-blur-md px-3.5 py-1.5 shadow-md active:scale-95"
              aria-label="Return to Heart"
            >
              <X className="w-3.5 h-3.5" />
              <span className="font-normal tracking-wide">Return to Heart</span>
            </button>
          </div>
        )}

        {/* Form Card with Hardware Acceleration Layer */}
        <div
          className="glass-card-cosmic form-card relative w-full transition-all duration-300"
          style={{ willChange: 'transform', transform: 'translateZ(0)' }}
        >
          {/* Header Section */}
          <div className="text-center mb-3">
            {/* Pill Badge with Dynamic Theme Colors */}
            <div className="theme-pill-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: 'var(--theme-primary)' }}
              />
              <span
                className="text-[9.5px] sm:text-[10px] font-sans font-semibold tracking-[0.2em] uppercase"
                style={{ color: 'var(--theme-primary)' }}
              >
                A Little Something Just For You
              </span>
            </div>

            {/* Main Heading in Cormorant Garamond */}
            <h1 className="font-serif text-[26px] sm:text-[30px] font-normal tracking-wide leading-[1.15] text-gradient-silver mb-0.5">
              Create a Little Universe
            </h1>

            {/* Subtitle */}
            <p className="font-serif italic text-[12px] sm:text-[13px] font-light text-white/65 tracking-wide max-w-sm mx-auto">
              "Some feelings deserve their own universe."
            </p>
          </div>

          {/* Error Notification */}
          {error && (
            <div className="mb-3 py-2 px-3.5 bg-red-950/40 border border-red-500/30 rounded-xl text-red-200 text-xs text-center animate-fade-in flex items-center justify-center gap-2">
              <span>{error}</span>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-2.5">
            {/* Field 1: YOUR NAME */}
            <div>
              <div className="flex justify-between items-center mb-1 px-0.5">
                <label
                  htmlFor="fromName"
                  className="text-[10px] font-sans font-medium uppercase tracking-[1.5px] text-slate-400"
                >
                  Your Name
                </label>
                <span className="text-[10px] font-sans text-slate-500">
                  {fromName.length}/30
                </span>
              </div>
              <input
                id="fromName"
                type="text"
                value={fromName}
                onChange={(e) => {
                  setFromName(e.target.value.slice(0, 30));
                  if (error) setError(null);
                }}
                placeholder="Your name"
                maxLength={30}
                className="theme-input w-full rounded-xl placeholder:text-slate-500"
                autoFocus={!isModal}
                required
              />
            </div>

            {/* Field 2: THEIR NAME */}
            <div>
              <div className="flex justify-between items-center mb-1 px-0.5">
                <label
                  htmlFor="toName"
                  className="text-[10px] font-sans font-medium uppercase tracking-[1.5px] text-slate-400"
                >
                  Their Name
                </label>
                <span className="text-[10px] font-sans text-slate-500">
                  {toName.length}/30
                </span>
              </div>
              <input
                id="toName"
                type="text"
                value={toName}
                onChange={(e) => {
                  setToName(e.target.value.slice(0, 30));
                  if (error) setError(null);
                }}
                placeholder="Someone special"
                maxLength={30}
                className="theme-input w-full rounded-xl placeholder:text-slate-500"
                required
              />
            </div>

            {/* Optional Personal Letter Accordion */}
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => setShowMessageEdit(!showMessageEdit)}
                className="flex items-center gap-1.5 text-[11px] py-0.5 transition-colors cursor-pointer group"
                style={{ color: 'var(--theme-primary)' }}
              >
                <MessageSquareHeart
                  className="w-3 h-3 group-hover:scale-110 transition-transform"
                  style={{ color: 'var(--theme-primary)' }}
                />
                <span className="opacity-90 group-hover:opacity-100 font-medium">
                  {showMessageEdit ? 'Hide personal letter' : '+ Add a personal letter (optional)'}
                </span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-300 ${
                    showMessageEdit ? 'rotate-180' : ''
                  }`}
                  style={{ color: 'var(--theme-primary)', opacity: 0.75 }}
                />
              </button>

              {showMessageEdit && (
                <div className="mt-1.5 animate-fade-in space-y-1.5">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write a sweet, romantic note to accompany the heart..."
                    rows={3}
                    className="theme-input w-full rounded-xl placeholder:text-slate-500 text-xs leading-relaxed custom-scrollbar"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setMessage(DEFAULT_ROMANTIC_MESSAGE)}
                      className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      Reset to default letter
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Melody / Song Selector */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-1 px-0.5">
                <label className="text-[9.5px] font-sans font-semibold uppercase tracking-[2px] text-slate-400">
                  CHOOSE COSMIC MELODY
                </label>
                <span
                  className="text-[10.5px] font-sans font-medium flex items-center gap-1.5 transition-colors"
                  style={{ color: 'var(--theme-primary)' }}
                >
                  <span>{SONGS.find((s) => s.id === selectedSong)?.title || 'Queen & Poet'}</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap max-w-full mx-auto py-0.5">
                {SONGS.map((song) => {
                  const isSelected = selectedSong === song.id;
                  return (
                    <button
                      key={song.id}
                      type="button"
                      onClick={() => {
                        setSelectedSong(song.id);
                        soundManager.setSong(song.src);
                      }}
                      className={`song-pill-btn transition-all duration-300 px-3 py-1 rounded-full text-xs flex items-center gap-1.5 cursor-pointer font-sans ${
                        isSelected
                          ? 'song-pill-active'
                          : 'song-pill-inactive text-slate-300/80 hover:text-white'
                      }`}
                      style={
                        {
                          touchAction: 'manipulation',
                          WebkitTapHighlightColor: 'transparent',
                        } as React.CSSProperties
                      }
                      title={`${song.title} - ${song.artist}`}
                    >
                      <svg
                        className="w-3 h-3 flex-shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--theme-primary)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ filter: isSelected ? 'drop-shadow(0 0 6px var(--theme-glow))' : undefined }}
                      >
                        <path d="M9 18V5l12-2v13" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="18" cy="16" r="3" />
                      </svg>
                      <span className="font-medium tracking-wide text-[11.5px]">{song.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Theme / Color Palette Selector */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-1.5 px-0.5">
                <label className="text-[9.5px] font-sans font-semibold uppercase tracking-[2px] text-slate-400">
                  CHOOSE COSMIC THEME
                </label>
                <span className="text-[10.5px] font-sans text-slate-300/90 font-medium flex items-center gap-1.5">
                  <span>{COSMIC_THEMES[selectedTheme].name}</span>
                  <svg
                    className="w-2.5 h-2.5 inline-block"
                    viewBox="0 0 24 24"
                    fill="var(--theme-primary)"
                    stroke="none"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 flex-wrap max-w-full mx-auto py-0.5">
                {(Object.keys(COSMIC_THEMES) as CosmicThemeId[]).map((themeKey) => {
                  const theme = COSMIC_THEMES[themeKey];
                  const isSelected = selectedTheme === themeKey;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleThemeSelect(theme.id)}
                      className={`theme-swatch-btn relative w-[26px] h-[26px] rounded-full cursor-pointer transition-transform duration-100 ease-out flex items-center justify-center p-0 ${
                        isSelected
                          ? 'scale-115 ring-2 ring-white/95 shadow-[0_0_12px_var(--swatch-glow)] z-10'
                          : 'opacity-75 hover:opacity-100 hover:scale-108 ring-1 ring-white/20 hover:ring-white/40'
                      }`}
                      style={
                        {
                          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                          '--swatch-glow': theme.glow,
                          touchAction: 'manipulation',
                          WebkitTapHighlightColor: 'transparent',
                        } as React.CSSProperties
                      }
                      title={theme.name}
                      aria-label={`Select ${theme.name} theme`}
                    >
                      {isSelected && (
                        <Check className="w-3 h-3 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] stroke-[2.5]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Call-to-Action Button with Shimmer Sweep & Celestial Drop-Shadow Boost */}
            <div className="pt-2">
              <button
                type="submit"
                className="relative overflow-hidden w-full py-2.5 sm:py-3 px-5 rounded-xl btn-cosmic-cta text-white font-sans font-medium text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 group cursor-pointer"
                style={{
                  background: COSMIC_THEMES[selectedTheme].btnGradient,
                  boxShadow: COSMIC_THEMES[selectedTheme].btnShadow,
                }}
              >
                {/* Diagonal Shimmer Sweep Light Beam */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer-sweep" />
                </div>

                <span className="relative z-10">Create Our Universe</span>
                <Sparkles className="relative z-10 w-3.5 h-3.5 text-sky-200 group-hover:rotate-12 transition-transform duration-300" />
              </button>
            </div>

            {/* Ethereal Footer Text */}
            <div className="pt-1 text-center">
              <p className="text-[10px] sm:text-[11px] text-slate-400/70 font-light tracking-wide flex items-center justify-center">
                <span>Made of stardust. Meant for someone special.</span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OpeningScreen;

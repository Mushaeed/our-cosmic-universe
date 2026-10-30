import React, { useState, useEffect, useCallback } from 'react';
import { Share2, Mail, PlusCircle, Check } from 'lucide-react';
import { ParticleHeartCanvas } from './components/ParticleHeartCanvas';
import { OpeningScreen } from './components/OpeningScreen';
import { RomanticMessageModal } from './components/RomanticMessageModal';
import { ShareModal } from './components/ShareModal';
import { SoundToggle } from './components/SoundToggle';
import { FloatingLyrics } from './components/FloatingLyrics';
import {
  DEFAULT_ROMANTIC_MESSAGE,
  SONGS,
  DEFAULT_SONG_ID,
  type CosmicThemeId,
  type PersonalizationData,
} from './types';
import { soundManager } from './utils/audio';
import { loadSRT } from './utils/srtParser';

if (typeof window !== 'undefined') {
  (window as unknown as { __soundManager: typeof soundManager }).__soundManager = soundManager;
}

const VALID_THEMES: CosmicThemeId[] = ['blue', 'purple', 'pink', 'red', 'gold', 'orange', 'aqua', 'pearl'];

const normalizeTheme = (raw: string): CosmicThemeId => {
  const clean = raw.trim().toLowerCase();
  if (clean === 'emerald') return 'aqua';
  return VALID_THEMES.includes(clean as CosmicThemeId) ? (clean as CosmicThemeId) : 'blue';
};

const normalizeSong = (raw: string): string => {
  const clean = raw.trim().toLowerCase();
  const found = SONGS.find((s) => s.id === clean);
  return found ? found.id : DEFAULT_SONG_ID;
};

export const App: React.FC = () => {
  // Parse query params safely on load
  const [personalization, setPersonalization] = useState<PersonalizationData>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const fromParam = (params.get('from') || '').trim().slice(0, 30);
      const toParam = (params.get('to') || '').trim().slice(0, 30);
      const msgParam = (params.get('msg') || '').trim();
      const themeParam = normalizeTheme(params.get('theme') || '');
      const songParam = normalizeSong(params.get('song') || '');

      if (fromParam && toParam) {
        return {
          fromName: fromParam,
          toName: toParam,
          message: msgParam || DEFAULT_ROMANTIC_MESSAGE,
          theme: themeParam,
          song: songParam,
        };
      }
    } catch {
      // ignore
    }
    return {
      fromName: '',
      toName: '',
      message: DEFAULT_ROMANTIC_MESSAGE,
      theme: 'blue',
      song: DEFAULT_SONG_ID,
    };
  });

  // Check if valid names already exist in state/URL
  const hasValidNames = Boolean(personalization.fromName && personalization.toName);

  // Screen state: '#form-screen' or '#viewer-screen'
  const [activeScreen, setActiveScreen] = useState<'form' | 'viewer'>(hasValidNames ? 'viewer' : 'form');

  const [previewTheme, setPreviewTheme] = useState<CosmicThemeId | null>(null);
  const activeTheme: CosmicThemeId = (activeScreen === 'form' && previewTheme) ? previewTheme : (personalization.theme || 'blue');

  // Sync document root data-theme on mount & when personalization.theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, [activeTheme]);

  // Load and synchronize song with audio engine
  useEffect(() => {
    const songObj = SONGS.find((s) => s.id === (personalization.song || DEFAULT_SONG_ID)) || SONGS[0];
    soundManager.init(songObj.src);
    soundManager.setSong(songObj.src);
    if (songObj.srt) {
      loadSRT(songObj.srt);
    }
  }, [personalization.song]);

  // Animation phase state: reveals the top prompt, couple names, quote, and 3 buttons
  const [hasHeartFormed, setHasHeartFormed] = useState(false);

  // Heart remount key to guarantee fresh animation on new generation
  const [heartKey, setHeartKey] = useState(0);

  // Modals for the viewer screen
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copyToast, setCopyToast] = useState(false);

  // Sync browser URL whenever personalization changes in heart mode
  const syncUrlParams = useCallback((data: PersonalizationData) => {
    try {
      const params = new URLSearchParams();
      params.set('from', data.fromName);
      params.set('to', data.toName);
      if (data.message && data.message.trim() !== DEFAULT_ROMANTIC_MESSAGE.trim()) {
        params.set('msg', data.message.trim());
      }
      if (data.theme && data.theme !== 'blue') {
        params.set('theme', data.theme);
      }
      if (data.song) {
        params.set('song', data.song);
      }
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
    } catch {
      // ignore
    }
  }, []);

  // Handle setup submission - updates names in memory, resets heart, and launches viewer
  const handleSetupSubmit = (data: PersonalizationData) => {
    setPersonalization(data);
    setPreviewTheme(null);
    const songObj = SONGS.find((s) => s.id === (data.song || DEFAULT_SONG_ID)) || SONGS[0];
    soundManager.setSong(songObj.src);
    soundManager.play();
    setHeartKey((prev) => prev + 1); // Forces fresh ParticleHeartCanvas mount with full intro
    setHasHeartFormed(false); // Keeps names & buttons hidden until heart forms
    setActiveScreen('viewer'); // Switches to #viewer-screen
    syncUrlParams(data);

    // Fallback safety timer: guarantees couple names and buttons appear even if frame rate drops
    setTimeout(() => {
      setHasHeartFormed(true);
    }, 4200);
  };

  // Ensure audio is paused whenever on the form screen
  useEffect(() => {
    if (activeScreen === 'form') {
      soundManager.pause();
    }
  }, [activeScreen]);

  // Handle "Create Another Heart" button click
  const handleCreateAnotherHeart = () => {
    soundManager.pause();
    setPreviewTheme(personalization.theme || 'blue');
    setShowMessageModal(false);
    setShowShareModal(false);
    setActiveScreen('form');
  };

  // Handle cancel/return to existing heart from form screen
  const handleCancelForm = () => {
    setPreviewTheme(null);
    if (hasValidNames) {
      setActiveScreen('viewer');
      setHasHeartFormed(true); // Heart is already assembled, immediately show names and buttons
    }
  };

  // Quick copy link action
  const handleQuickCopyLink = async () => {
    try {
      const params = new URLSearchParams();
      params.set('from', personalization.fromName);
      params.set('to', personalization.toName);
      if (personalization.message && personalization.message.trim() !== DEFAULT_ROMANTIC_MESSAGE.trim()) {
        params.set('msg', personalization.message.trim());
      }
      if (personalization.theme && personalization.theme !== 'blue') {
        params.set('theme', personalization.theme);
      }
      if (personalization.song) {
        params.set('song', personalization.song);
      }
      const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 3000);
    } catch {
      setShowShareModal(true);
    }
  };

  // Listen to popstate for browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const fromParam = (params.get('from') || '').trim().slice(0, 30);
      const toParam = (params.get('to') || '').trim().slice(0, 30);
      const msgParam = (params.get('msg') || '').trim();
      const themeParam = normalizeTheme(params.get('theme') || '');
      const songParam = normalizeSong(params.get('song') || '');

      if (fromParam && toParam) {
        setPersonalization({
          fromName: fromParam,
          toName: toParam,
          message: msgParam || DEFAULT_ROMANTIC_MESSAGE,
          theme: themeParam,
          song: songParam,
        });
        setHeartKey((prev) => prev + 1);
        setHasHeartFormed(false);
        setActiveScreen('viewer');
      } else {
        soundManager.pause();
        setActiveScreen('form');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <main
      data-theme={activeTheme}
      className="main-container fixed inset-0 w-full h-full text-white overflow-hidden select-none"
    >
      {/* Optional Ambient Sound Synthesizer Toggle */}
      <SoundToggle />

      {/* Quick Copy Floating Toast Notification */}
      {copyToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 py-2.5 px-5 bg-black/90 border border-white/20 rounded-full text-white text-xs sm:text-sm shadow-[0_0_25px_var(--theme-glow)] backdrop-blur-xl animate-fade-in flex items-center gap-2 pointer-events-none">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>Your special link is copied!</span>
          <svg
            className="w-3.5 h-3.5 inline-block"
            viewBox="0 0 24 24"
            fill="var(--theme-primary)"
            stroke="none"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      )}

      {/* SCREEN 1: #form-screen (The "Create a Little Universe" input card) */}
      <div
        id="form-screen"
        className={`fixed inset-0 z-40 flex items-center justify-center overflow-y-auto ${
          activeScreen === 'form' ? 'fade-in' : 'fade-out hidden'
        }`}
      >
        <OpeningScreen
          initialData={personalization}
          onSubmit={handleSetupSubmit}
          canReturnToHeart={hasValidNames}
          onReturnToHeart={handleCancelForm}
          onThemePreview={setPreviewTheme}
        />
      </div>

      {/* SCREEN 2: #viewer-screen (The heart, top text, couple names, and the 3 bottom buttons) */}
      <div
        id="viewer-screen"
        className={`fixed inset-0 z-20 flex flex-col justify-between ${
          activeScreen === 'viewer' ? 'fade-in' : 'fade-out hidden'
        }`}
      >
        {/* Restored Original HTML5 Canvas Particle Heart Engine */}
        <ParticleHeartCanvas
          key={heartKey}
          theme={activeTheme}
          onFormed={() => setHasHeartFormed(true)}
          interactive={activeScreen === 'viewer' && !showMessageModal && !showShareModal}
          active={activeScreen === 'viewer'}
        />

        {/* Left-Side Floating Lyrics Display */}
        <FloatingLyrics
          songId={personalization.song || DEFAULT_SONG_ID}
          visible={hasHeartFormed && activeScreen === 'viewer' && !showMessageModal && !showShareModal}
        />

        {/* Foreground Interface Overlay with clear vertical hierarchy */}
        <div className="relative z-20 w-full h-full flex flex-col justify-between pointer-events-none p-4 sm:p-6 pb-6 sm:pb-8">
          {/* Top Interactive Prompt (reveals after heart formation) */}
          <div
            className={`w-full flex justify-center pt-2 sm:pt-4 px-4 transition-opacity duration-700 ${
              hasHeartFormed ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span className="top-instruction-text">
              Tap the heart to spark stardust
            </span>
          </div>

          {/* Bottom Personalized Section (smoothly reveals after compression-to-heart transition) */}
          <div
            className={`w-full max-w-xl mx-auto flex flex-col items-center text-center mt-auto pb-2 sm:pb-5 transition-all duration-700 ease-out ${
              hasHeartFormed
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
          >
            {/* The Two Names - Upgraded Typography & Beating Theme Heart */}
            <div className="relative mb-2 px-4">
              <div className="couple-names-container">
                <span className="couple-name-text">{personalization.fromName}</span>
                <span className="theme-center-heart">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 inline-block"
                    viewBox="0 0 24 24"
                    fill="var(--theme-primary)"
                    stroke="none"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </span>
                <span className="couple-name-text">{personalization.toName}</span>
              </div>
            </div>

            {/* Romantic Subtitle Message with Hairline Flourishes */}
            <div className="romantic-quote-container">
              <span className="quote-hairline quote-hairline-left" />
              <p className="romantic-quote-text">
                "Somewhere in this universe, my heart chose you."
              </p>
              <span className="quote-hairline quote-hairline-right" />
            </div>

            {/* Action Buttons Row */}
            <div className="pointer-events-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-2.5 w-full max-w-xs sm:max-w-xl mx-auto px-4">
              {/* Button 1: Open My Message (Primary Action) */}
              <button
                onClick={() => setShowMessageModal(true)}
                className="theme-action-btn-primary w-full sm:w-auto h-8.5 sm:h-9.5 px-5 rounded-full text-xs sm:text-sm font-normal tracking-wide flex items-center justify-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
                title="Open romantic letter"
              >
                <Mail className="w-3.5 h-3.5 transition-colors" style={{ color: 'var(--theme-primary)' }} />
                <span>Open My Message</span>
              </button>

              {/* Button 2: Copy Special Link (Secondary Action) */}
              <button
                onClick={handleQuickCopyLink}
                className="theme-action-btn-secondary w-full sm:w-auto h-8.5 sm:h-9.5 px-5 rounded-full text-xs sm:text-sm font-light tracking-wide flex items-center justify-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
                title="Copy shareable link"
              >
                <Share2 className="w-3.5 h-3.5 transition-colors" style={{ color: 'var(--theme-primary)' }} />
                <span>Copy Special Link</span>
              </button>

              {/* Button 3: Create Another Heart (Tertiary Action) */}
              <button
                onClick={handleCreateAnotherHeart}
                className="theme-action-btn-tertiary w-full sm:w-auto h-8 sm:h-9 px-4 rounded-full text-xs font-light tracking-wide flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
                title="Create another heart with new names"
              >
                <PlusCircle className="w-3 h-3 transition-colors" style={{ color: 'var(--theme-primary)' }} />
                <span>Create Another Heart</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: ROMANTIC LETTER OVERLAY */}
      {showMessageModal && (
        <RomanticMessageModal
          fromName={personalization.fromName}
          toName={personalization.toName}
          message={personalization.message}
          onClose={() => setShowMessageModal(false)}
        />
      )}

      {/* MODAL 2: SHAREABLE LINK & DEPLOYMENT GUIDE */}
      {showShareModal && (
        <ShareModal
          data={personalization}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </main>
  );
};

export default App;

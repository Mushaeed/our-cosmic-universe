import React, { useState } from 'react';
import { Copy, Check, Share2, Globe, ExternalLink, X } from 'lucide-react';
import { DEFAULT_ROMANTIC_MESSAGE, COSMIC_THEMES, type PersonalizationData } from '../types';

interface ShareModalProps {
  data: PersonalizationData;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ data, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 380);
  };

  const themeConfig = data.theme ? COSMIC_THEMES[data.theme] || COSMIC_THEMES.blue : COSMIC_THEMES.blue;

  // Construct query string safely
  const buildShareUrl = (): string => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const params = new URLSearchParams();

    params.set('from', data.fromName);
    params.set('to', data.toName);

    // Only include message if it's customized to keep the URL concise
    if (data.message && data.message.trim() !== DEFAULT_ROMANTIC_MESSAGE.trim()) {
      params.set('msg', data.message.trim());
    }

    // Preserve theme
    if (data.theme && data.theme !== 'blue') {
      params.set('theme', data.theme);
    }

    // Preserve song
    if (data.song) {
      params.set('song', data.song);
    }

    return `${origin}${pathname}?${params.toString()}`;
  };

  const shareUrl = buildShareUrl();
  const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:';

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for non-https or older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (!successful) throw new Error('Copy command failed');
      }

      setCopied(true);
      setCopyError(null);
      setTimeout(() => setCopied(false), 3500);
    } catch {
      setCopyError('Could not copy automatically. Please select and copy the link above.');
    }
  };

  return (
    <div
      className={`letter-modal-backdrop select-none ${isClosing ? 'closing' : ''}`}
      onClick={handleClose}
    >
      <div
        className={`letter-modal relative z-10 w-full max-w-lg mx-auto bg-neutral-950/95 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl overflow-hidden ${
          isClosing ? 'closing' : 'active'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{
          border: '1px solid var(--theme-border)',
          boxShadow: '0 0 50px -10px var(--theme-glow), 0 25px 60px rgba(0,0,0,0.85)',
        }}
      >
        {/* Soft glowing ambient lighting inside card */}
        <div
          className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'var(--theme-glow-subtle)' }}
        />
        <div
          className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'var(--theme-secondary-glow)' }}
        />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          aria-label="Close share dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div
            className="inline-flex items-center justify-center w-11 h-11 rounded-full mb-2"
            style={{
              background: 'var(--theme-btn-bg)',
              border: '1px solid var(--theme-border)',
              boxShadow: '0 0 20px var(--theme-glow-subtle)',
            }}
          >
            <Share2 className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
          </div>
          <h2 className="text-xl sm:text-2xl font-serif text-slate-100 font-medium flex items-center justify-center gap-2">
            <span>Share Your Little Universe</span>
            <svg
              className="w-5 h-5 inline-block"
              viewBox="0 0 24 24"
              fill="var(--theme-primary)"
              stroke="none"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </h2>
          <p className="text-xs text-slate-300/80 mt-1">
            When {data.toName} opens this link, they will directly see your glowing heart and secret message!
          </p>
        </div>

        {/* Preview of personalized badge */}
        <div className="mb-4 py-2.5 px-4 bg-white/[0.04] border border-white/10 rounded-xl text-center flex items-center justify-center gap-2 text-sm text-slate-200">
          <span className="font-semibold text-white">{data.fromName}</span>
          <svg
            className="w-4 h-4 inline-block animate-pulse"
            viewBox="0 0 24 24"
            fill="var(--theme-primary)"
            stroke="none"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span className="font-semibold text-white">{data.toName}</span>
        </div>

        {/* Shareable Link Input */}
        <div className="mb-3">
          <label className="text-[11px] uppercase tracking-wider text-slate-300 font-medium block mb-1.5">
            Your Personalized Link:
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              readOnly
              value={shareUrl}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="theme-input w-full px-3.5 py-2.5 rounded-xl text-xs font-mono select-all"
            />
            <button
              onClick={handleCopy}
              className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                  : 'text-white'
              }`}
              style={
                !copied
                  ? {
                      background: themeConfig.btnGradient,
                      boxShadow: themeConfig.btnShadow,
                    }
                  : undefined
              }
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Confirmation Toast */}
        {copied && (
          <div
            className="mb-3 py-2 px-3 rounded-xl text-xs text-center animate-fade-in flex items-center justify-center gap-1.5"
            style={{
              background: 'var(--theme-btn-bg)',
              border: '1px solid var(--theme-border)',
              color: 'var(--theme-primary)',
            }}
          >
            <span>Your special link is copied! Send it with love</span>
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

        {copyError && (
          <div className="mb-3 py-2 px-3 bg-red-950/50 border border-red-500/30 rounded-xl text-red-200 text-xs text-center">
            {copyError}
          </div>
        )}

        {/* Localhost Notice & Free Deployment Guide */}
        {isLocalhost ? (
          <div className="mt-4 p-3.5 bg-sky-950/40 border border-cyan-500/30 rounded-2xl text-left space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-medium text-xs">
              <Globe className="w-4 h-4" />
              <span>How to send to your crush (Public URL):</span>
            </div>
            <p className="text-[11px] text-sky-200/80 leading-relaxed">
              Right now you are testing locally on <code className="text-cyan-200 font-mono">localhost</code>. To send this to your crush on their phone, deploy it free in 1 minute:
            </p>
            <ol className="text-[11px] text-sky-300/80 list-decimal list-inside space-y-1 pl-1">
              <li>
                <strong className="text-white">Vercel:</strong> Run <code className="text-cyan-200 font-mono">npx vercel</code> in your project terminal or push to GitHub and import to <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline inline-flex items-center gap-0.5">Vercel <ExternalLink className="w-2.5 h-2.5" /></a>.
              </li>
              <li>
                <strong className="text-white">Netlify:</strong> Drag and drop your <code className="text-cyan-200 font-mono">dist</code> folder onto <a href="https://app.netlify.com/drop" target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline inline-flex items-center gap-0.5">Netlify Drop <ExternalLink className="w-2.5 h-2.5" /></a>.
              </li>
            </ol>
            <p className="text-[10px] text-sky-400/60 italic">
              Once deployed, open your live link, personalize it, and send the special link!
            </p>
          </div>
        ) : (
          <p className="mt-3 text-[11px] text-center text-sky-300/60">
            Send this URL via WhatsApp, iMessage, Instagram, or email.
          </p>
        )}

        <div className="mt-5 flex justify-center">
          <button
            onClick={handleClose}
            className="text-xs text-sky-300/70 hover:text-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

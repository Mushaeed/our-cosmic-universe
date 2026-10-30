import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface RomanticMessageModalProps {
  fromName: string;
  toName: string;
  message: string;
  onClose: () => void;
}

export const RomanticMessageModal: React.FC<RomanticMessageModalProps> = ({
  fromName,
  toName,
  message,
  onClose,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    // Smooth 320ms exit duration before unmounting from parent
    setTimeout(() => {
      onClose();
    }, 320);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isClosing]);

  const paragraphs = message.split('\n\n').filter((p) => p.trim());
  const footerDelay = `${0.52 + Math.max(3, paragraphs.length) * 0.2}s`;

  return (
    <div
      className={`letter-modal-backdrop select-none ${isClosing ? 'closing' : ''}`}
      onClick={handleClose}
    >
      <div
        className={`letter-modal romantic-modal-card relative z-10 w-full max-w-lg mx-auto rounded-3xl p-6 sm:p-9 overflow-hidden ${
          isClosing ? 'closing' : 'active'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Soft glowing ambient lighting inside card */}
        <div
          className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'var(--theme-glow-subtle)' }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'var(--theme-secondary-glow)' }}
        />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          aria-label="Close romantic message"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Staggered Cascading Reveal */}
        <div className="text-center mb-6">
          {/* Top Badge (Delay: 0.15s) */}
          <div
            className="stagger-item romantic-modal-badge modal-badge inline-flex items-center justify-center w-10 h-10 rounded-full mb-2"
            style={{ transitionDelay: '0.15s' }}
          >
            <svg
              className="w-5 h-5 inline-block"
              viewBox="0 0 24 24"
              fill="var(--theme-primary)"
              stroke="none"
              style={{ filter: 'drop-shadow(0 0 8px var(--theme-glow))' }}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>

          {/* Subtitle Label (Delay: 0.15s) */}
          <h2
            className="stagger-item text-xs sm:text-sm font-sans tracking-widest uppercase font-semibold"
            style={{ color: 'var(--theme-primary)', transitionDelay: '0.15s' }}
          >
            A Letter For You
          </h2>

          {/* Recipient Header with 4-Point Celestial Star (Delay: 0.32s) */}
          <div
            className="stagger-item text-lg sm:text-xl font-serif text-slate-100 font-normal mt-1 flex items-center justify-center gap-2"
            style={{ transitionDelay: '0.32s' }}
          >
            <span>Dearest {toName}</span>
            <svg
              className="w-4 h-4 inline-block"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--theme-primary)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0 0 6px var(--theme-glow))' }}
            >
              <path d="M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z" />
            </svg>
          </div>
        </div>

        {/* Message Body with Staggered Cascading Reveal (Delays: 0.52s, 0.72s, 0.92s...) */}
        <div className="my-6 max-h-[55vh] overflow-y-auto px-2 space-y-4 custom-scrollbar text-center">
          {paragraphs.map((paragraph, idx) => {
            const delay = `${0.52 + idx * 0.2}s`;
            return (
              <p
                key={idx}
                className="stagger-item font-serif text-base sm:text-lg text-slate-100/95 leading-relaxed sm:leading-loose tracking-wide italic font-light"
                style={{ transitionDelay: delay }}
              >
                "{paragraph.trim()}"
              </p>
            );
          })}
        </div>

        {/* Signature (Delay: 1.12s) */}
        <div
          className="stagger-item mt-8 pt-4 text-center"
          style={{
            borderTop: '1px solid var(--theme-border)',
            transitionDelay: footerDelay,
          }}
        >
          <p
            className="text-xs uppercase tracking-widest font-sans mb-1"
            style={{ color: 'var(--theme-primary)', opacity: 0.75 }}
          >
            Forever yours,
          </p>
          <p className="font-serif text-lg sm:text-xl font-medium text-white drop-shadow-[0_0_8px_var(--theme-glow)]">
            {fromName}
          </p>
        </div>

        {/* Dismiss Button (Delay: 1.12s) */}
        <div
          className="stagger-item mt-6 flex justify-center"
          style={{ transitionDelay: footerDelay }}
        >
          <button
            onClick={handleClose}
            className="romantic-modal-btn py-2.5 px-6 rounded-full text-xs sm:text-sm font-medium tracking-wide cursor-pointer flex items-center gap-2"
          >
            <span>Return to Our Stars</span>
            <svg
              className="w-3.5 h-3.5 inline-block"
              viewBox="0 0 24 24"
              fill="var(--theme-primary)"
              stroke="none"
              style={{ filter: 'drop-shadow(0 0 6px var(--theme-glow))' }}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RomanticMessageModal;

import React, { useState } from 'react';
import { Sparkles, Heart, MessageSquareHeart, X } from 'lucide-react';
import { DEFAULT_ROMANTIC_MESSAGE, type PersonalizationData } from '../types';

interface NameSetupModalProps {
  initialData?: PersonalizationData;
  onSubmit: (data: PersonalizationData) => void;
  isModal?: boolean;
  onCloseModal?: () => void;
}

export const NameSetupModal: React.FC<NameSetupModalProps> = ({
  initialData,
  onSubmit,
  isModal = false,
  onCloseModal,
}) => {
  const [fromName, setFromName] = useState(initialData?.fromName || '');
  const [toName, setToName] = useState(initialData?.toName || '');
  const [message, setMessage] = useState(initialData?.message || DEFAULT_ROMANTIC_MESSAGE);
  const [showMessageEdit, setShowMessageEdit] = useState(Boolean(initialData?.message && initialData.message !== DEFAULT_ROMANTIC_MESSAGE));
  const [error, setError] = useState<string | null>(null);

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
      setError("Please enter your crush's name");
      return;
    }

    setError(null);
    onSubmit({
      fromName: cleanFrom,
      toName: cleanTo,
      message: cleanMsg || DEFAULT_ROMANTIC_MESSAGE,
    });
  };

  return (
    <div
      className={`relative z-30 flex items-center justify-center p-4 min-h-screen ${
        isModal ? 'bg-black/80 backdrop-blur-md animate-fade-in' : ''
      }`}
    >
      <div className="w-full max-w-md mx-auto bg-black/90 border border-sky-500/30 shadow-[0_0_50px_rgba(0,180,255,0.22)] rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden transition-all duration-300">
        {/* Subtle glowing ambient corners */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />

        {isModal && onCloseModal && (
          <button
            onClick={onCloseModal}
            className="absolute top-4 right-4 text-sky-300/60 hover:text-white transition-colors p-2 cursor-pointer"
            aria-label="Close setup modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-950/60 border border-cyan-400/30 text-cyan-300 mb-3 shadow-[0_0_20px_rgba(0,240,255,0.3)] animate-pulse">
            <Heart className="w-6 h-6 fill-cyan-400/40 text-cyan-300" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-cyan-100 to-blue-300 font-semibold mb-2">
            Create a Little Universe
          </h1>
          <p className="text-xs sm:text-sm text-sky-200/70 tracking-wide font-light">
            Make something special for someone special.
          </p>
        </div>

        {error && (
          <div className="mb-4 py-2 px-3.5 bg-red-950/40 border border-red-500/40 rounded-xl text-red-200 text-xs sm:text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="fromName" className="text-xs uppercase tracking-wider text-sky-300/90 font-medium">
                Your Name
              </label>
              <span className="text-[10px] text-sky-400/60">{fromName.length}/30</span>
            </div>
            <input
              id="fromName"
              type="text"
              value={fromName}
              onChange={(e) => {
                setFromName(e.target.value.slice(0, 30));
                if (error) setError(null);
              }}
              placeholder="Enter your name"
              maxLength={30}
              className="w-full px-4 py-3 bg-neutral-950/80 border border-sky-500/30 rounded-xl text-white placeholder-sky-400/30 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-sm transition-all"
              autoFocus={!isModal}
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="toName" className="text-xs uppercase tracking-wider text-sky-300/90 font-medium">
                Their Name
              </label>
              <span className="text-[10px] text-sky-400/60">{toName.length}/30</span>
            </div>
            <input
              id="toName"
              type="text"
              value={toName}
              onChange={(e) => {
                setToName(e.target.value.slice(0, 30));
                if (error) setError(null);
              }}
              placeholder="Enter your crush's name"
              maxLength={30}
              className="w-full px-4 py-3 bg-neutral-950/80 border border-sky-500/30 rounded-xl text-white placeholder-sky-400/30 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-sm transition-all"
              required
            />
          </div>

          {/* Optional Message Customizer Accordion */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowMessageEdit(!showMessageEdit)}
              className="w-full flex items-center justify-between text-xs text-sky-300/80 hover:text-cyan-300 py-1 transition-colors group"
            >
              <span className="flex items-center gap-1.5">
                <MessageSquareHeart className="w-3.5 h-3.5 text-cyan-400" />
                Customize secret message (optional)
              </span>
              <span className="text-[11px] text-sky-400/60 group-hover:text-cyan-300">
                {showMessageEdit ? '▲ Hide' : '▼ Edit message'}
              </span>
            </button>

            {showMessageEdit && (
              <div className="mt-2 animate-fade-in">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your secret romantic message..."
                  rows={4}
                  className="w-full px-3.5 py-2.5 bg-neutral-950/80 border border-sky-500/30 rounded-xl text-sky-100 placeholder-sky-400/30 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-xs sm:text-sm transition-all leading-relaxed"
                />
                <button
                  type="button"
                  onClick={() => setMessage(DEFAULT_ROMANTIC_MESSAGE)}
                  className="text-[10px] text-sky-400/70 hover:text-cyan-300 mt-1"
                >
                  Reset to default romantic message
                </button>
              </div>
            )}
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:via-sky-400 hover:to-blue-500 text-white font-medium text-sm sm:text-base tracking-wide shadow-[0_0_30px_rgba(0,190,255,0.45)] hover:shadow-[0_0_40px_rgba(0,230,255,0.65)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Create Our Heart</span>
              <Sparkles className="w-4 h-4 text-cyan-200 group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

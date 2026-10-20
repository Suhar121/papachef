import React, { useState } from 'react';
import { Volume2, Mic, X, Send, BellRing, Sparkles } from 'lucide-react';
import { audioService } from '../services/audioService';

interface IntercomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBroadcastMessage: (msg: string) => void;
  seniorMode: boolean;
}

export const IntercomModal: React.FC<IntercomModalProps> = ({
  isOpen,
  onClose,
  onBroadcastMessage,
  seniorMode
}) => {
  const [customText, setCustomText] = useState('');

  if (!isOpen) return null;

  const quickMessages = [
    'Chef! Rush order coming through for Table 2!',
    'Chef, please make Table 4 extra crispy and less salt!',
    'Attention kitchen: Table 3 is asking for status update!',
    'Great job team! Order 101 table loved the burgers!',
    'Chef! Hold onions on the current ticket please!'
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    audioService.playKitchenBell();
    audioService.speakOrderToChef(text);
    onBroadcastMessage(text);
    setCustomText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div
        className={`bg-white border-2 border-orange-300 shadow-2xl rounded-3xl w-full max-w-lg overflow-hidden transition-all ${
          seniorMode ? 'p-8 text-lg' : 'p-6 text-base'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-orange-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-inner">
              <Mic className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className={`font-heading font-bold text-stone-900 ${seniorMode ? 'text-2xl' : 'text-xl'}`}>
                Counter Intercom: Call Chef
              </h3>
              <p className="text-stone-500 text-xs">
                Speaks aloud in the kitchen & rings the counter bell immediately
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
              ⚡ 1-Tap Quick Announcements for Papaw:
            </label>
            <div className="space-y-2">
              {quickMessages.map((msg, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(msg)}
                  className={`w-full text-left px-4 py-3 rounded-2xl border border-orange-200 bg-orange-50/60 hover:bg-orange-100/90 text-stone-800 font-medium flex items-center justify-between group transition-all shadow-xs active:scale-[0.99] ${
                    seniorMode ? 'text-base py-3.5' : 'text-sm'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-orange-600 shrink-0 group-hover:rotate-12 transition-transform" />
                    <span>{msg}</span>
                  </span>
                  <Volume2 className="w-4 h-4 text-orange-500 opacity-60 group-hover:opacity-100 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
              Or Type Custom Message to Speak to Kitchen:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend(customText);
                }}
                placeholder="e.g. Table 5 needs extra hot gravy..."
                className={`flex-1 border-2 border-stone-200 rounded-2xl px-4 py-3 focus:outline-hidden focus:border-orange-500 text-stone-900 bg-stone-50 ${
                  seniorMode ? 'text-lg' : 'text-sm'
                }`}
              />
              <button
                onClick={() => handleSend(customText)}
                disabled={!customText.trim()}
                className="px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-2xl shadow-md hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95 shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>Speak</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-2 pt-3 border-t border-orange-100 flex items-center justify-between text-xs text-stone-500">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-orange-500" />
            No need to walk back and forth or shout across tables!
          </span>
          <button
            onClick={() => audioService.playKitchenBell()}
            className="text-orange-600 hover:text-orange-700 font-semibold underline underline-offset-2"
          >
            Ding bell only 🔔
          </button>
        </div>
      </div>
    </div>
  );
};

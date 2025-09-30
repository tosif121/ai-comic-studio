'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, X } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [geminiKey, setGeminiKey] = useState('');
  const [elevenLabsKey, setElevenLabsKey] = useState('');

  // Restore scroll when modal closes
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      // Load stored keys
      setGeminiKey(localStorage.getItem('GEMINI_API_KEY') || '');
      setElevenLabsKey(localStorage.getItem('ELEVENLABS_API_KEY') || '');

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('GEMINI_API_KEY', geminiKey);
    localStorage.setItem('ELEVENLABS_API_KEY', elevenLabsKey);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-3xl max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-6 text-center border-b border-white/10 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          <KeyRound className="w-12 h-12 text-purple-400 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-white mb-2">API Keys Required</h3>
          <p className="text-gray-300">
            Enter your <span className="text-purple-400">Gemini</span> and{' '}
            <span className="text-pink-400">ElevenLabs</span> API keys to continue
          </p>
        </div>

        {/* Input Fields */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Gemini API Key</label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="Enter Gemini API Key"
              className="w-full rounded-xl bg-black border border-white/20 px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">ElevenLabs API Key</label>
            <input
              type="password"
              value={elevenLabsKey}
              onChange={(e) => setElevenLabsKey(e.target.value)}
              placeholder="Enter ElevenLabs API Key"
              className="w-full rounded-xl bg-black border border-white/20 px-4 py-2 text-white focus:ring-2 focus:ring-pink-500 outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 
            text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center"
          >
            Save Keys
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-gray-700 text-gray-300 hover:bg-white/5 py-3 rounded-xl transition-all duration-300"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ApiKeyModal;

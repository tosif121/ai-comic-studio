'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Download, Video, Volume2, RefreshCw, X } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;

      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  const handleUpgrade = () => {
    onUpgrade();
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
        className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-3xl max-w-2xl w-full overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header with close button */}
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-6 text-center border-b border-white/10 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-white mb-2">Unlock Pro Features</h3>
          <p className="text-gray-300">Get access to all premium features with a Pro account</p>
        </div>

        {/* Feature Grid */}
        <div className="p-6 grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-xl p-4 flex flex-col items-center">
            <Download className="w-8 h-8 text-purple-400 mb-2" />
            <div className="text-white font-medium text-sm text-center">High-Res Downloads</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 flex flex-col items-center">
            <Video className="w-8 h-8 text-pink-400 mb-2" />
            <div className="text-white font-medium text-sm text-center">Video Generation</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 flex flex-col items-center">
            <Volume2 className="w-8 h-8 text-green-400 mb-2" />
            <div className="text-white font-medium text-sm text-center">Voice Narration</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 flex flex-col items-center">
            <RefreshCw className="w-8 h-8 text-cyan-400 mb-2" />
            <div className="text-white font-medium text-sm text-center">Panel Regeneration</div>
          </div>
        </div>

        {/* Pricing Info */}
        <div className="px-6 pb-4 text-center">
          <div className="inline-flex items-baseline justify-center mb-2">
            <span className="text-3xl font-bold text-white">$9</span>
            <span className="text-gray-400 ml-1">/month</span>
          </div>
          <p className="text-gray-400 text-sm">Cancel anytime • 7-day free trial</p>
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleUpgrade}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 
            text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center"
          >
            <Crown className="w-5 h-5 mr-2" />
            Upgrade to Pro
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-gray-700 text-gray-300 hover:bg-white/5 py-3 rounded-xl transition-all duration-300"
          >
            Maybe Later
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PricingModal;

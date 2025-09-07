'use client';

import React from 'react';
import { Crown } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-3xl max-w-md w-full p-8 text-center">
        <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-white mb-4">Upgrade to Pro</h3>
        <p className="text-gray-400 mb-6">Unlock unlimited comics and premium features</p>
        <div className="space-y-3">
          <button
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-2xl transition-all duration-300 hover:scale-105"
          >
            Upgrade Now
          </button>
          <button
            onClick={onClose}
            className="w-full border border-white/20 text-white hover:bg-white/10 py-3 rounded-2xl transition-all duration-300"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;

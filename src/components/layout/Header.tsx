'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Sparkles, Crown, Menu, X } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  dailyUsage: number;
  isProUser: boolean;
  onShowPricing: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView, dailyUsage, isProUser, onShowPricing }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="z-50 backdrop-blur-2xl bg-white/5 border-b border-white/10 shadow-2xl fixed w-full top-0"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setCurrentView('home')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <motion.div
                className="absolute -inset-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              />
              <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-2 sm:p-3">
                <Palette className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                AI Comic Studio
              </h1>
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Powered by Nano Banana & Elevenlabs
              </p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <motion.div
                className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                {isProUser ? (
                  <>
                    <Crown className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-white">Pro</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-white">{dailyUsage}/100 Free</span>
                  </>
                )}
              </motion.div>

              {!isProUser && (
                <button
                  onClick={onShowPricing}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-4 sm:px-6 py-2 rounded-full shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center gap-2 text-sm sm:text-base"
                >
                  <Crown className="w-4 h-4" />
                  Go Pro
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu button */}
          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
          >
            <div className="flex flex-col space-y-4">
              <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 flex items-center gap-2 justify-center">
                {isProUser ? (
                  <>
                    <Crown className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-white">Pro</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-white">{dailyUsage}/100 Free</span>
                  </>
                )}
              </div>
              {!isProUser && (
                <button
                  onClick={onShowPricing}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-full shadow-lg flex items-center gap-2 justify-center py-2 text-sm sm:text-base"
                >
                  <Crown className="w-4 h-4" />
                  Go Pro
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;

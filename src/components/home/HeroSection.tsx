'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Palette, ArrowRight, Play, Star, Sparkles, Zap, Wand2, Brush } from 'lucide-react';

interface HeroSectionProps {
  onCreateComic: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onCreateComic }) => {
  return (
    <section className="pb-24 mt-48 bg-gradient-to-b from-black via-gray-950 to-black overflow-hidden text-center">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-6 py-3 mb-8 hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black"
          tabIndex={0}
          role="button"
          aria-label="Powered by Gemini 2.5 Flash"
        >
          <Star className="w-4 h-4 text-yellow-400 animate-pulse" />
          <span className="text-sm font-medium text-purple-300">Powered by Gemini 2.5 Flash</span>
          <Sparkles className="w-4 h-4 text-pink-400" />
        </motion.div>

        {/* Main Headline */}
        <div className="space-y-4 mb-8">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl md:text-8xl font-black leading-tight"
          >
            <span className="block bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent mb-2">
              Transform Stories
            </span>
            <motion.span
              className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent"
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ backgroundSize: '200% 200%' }}
            >
              Into Comics
            </motion.span>
          </motion.h2>

          {/* Floating Icons - Optimized for performance */}
          <div className="relative hidden md:block">
            {[
              { Icon: Sparkles, delay: 0, position: '-top-20 -left-20', color: 'text-yellow-400' },
              { Icon: Brush, delay: 1, position: '-top-16 -right-16', color: 'text-pink-400' },
              { Icon: Zap, delay: 2, position: '-bottom-10 -left-16', color: 'text-cyan-400' },
              { Icon: Wand2, delay: 0.5, position: '-bottom-12 -right-20', color: 'text-purple-400' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className={`absolute ${item.position}`}
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: item.delay, ease: 'easeInOut' }}
              >
                <item.Icon className={`w-8 h-8 ${item.color} drop-shadow-lg opacity-50`} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12 px-4"
        >
          Create stunning comics with consistent characters in under 60 seconds. Just speak your idea and watch AI bring it to life with cinematic quality.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20 px-4"
        >
          <motion.button
            onClick={onCreateComic}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 text-white text-xl font-bold px-12 py-6 rounded-2xl shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black"
            aria-label="Create Your Comic"
          >
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
            <span className="relative flex items-center space-x-3 justify-center">
              <Palette className="w-6 h-6 md:block hidden" />
              <span>Create Your Comic</span>
              <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <ArrowRight className="w-6 h-6" />
              </motion.div>
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 text-lg px-10 py-6 rounded-2xl backdrop-blur-sm transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
            aria-label="Watch Demo"
          >
            <Play className="w-5 h-5 mr-2 inline group-hover:scale-110 transition-transform" />
            Watch Demo
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

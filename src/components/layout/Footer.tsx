'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Github, Twitter, Mail, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-16 border-t border-white/10 bg-white/5 backdrop-blur-2xl"
    >
      <div className="container mx-auto max-w-7xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Branding */}
        <div className="text-center md:text-left space-y-1">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI Comic Studio
          </h2>
          <p className="text-sm text-gray-400">Turn your ideas into illustrated stories in seconds ✨</p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-gray-400">
          <a
            href="https://github.com/tosif121/ai-comic-studio"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
          <a
            href="https://x.com/its_tossi"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            <Twitter className="w-5 h-5" />
          </a>
          <a href="mailto:tosifdevra786@gmail.com" className="hover:text-white transition-colors">
            <Mail className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-4 text-center text-xs text-gray-500 px-4">
        <p className="flex items-center justify-center gap-1 flex-wrap">
          Made with <Heart className="w-4 h-4 text-pink-500 animate-pulse" /> by Nano Banana & Elevenlabs
        </p>
        <p className="mt-1">&copy; {new Date().getFullYear()} AI Comic Studio. All rights reserved.</p>
      </div>
    </motion.footer>
  );
};

export default Footer;

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Zap, Heart } from 'lucide-react';

const DemoGallery: React.FC = () => {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            See the{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Magic</span>
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400"
          >
            Comics generated from simple story prompts
          </motion.p>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 rounded-3xl blur-2xl" />
          <div className="relative bg-black/60 backdrop-blur-2xl border border-white/20 overflow-hidden rounded-3xl p-8">
            {/* Demo Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group relative aspect-square bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl border border-white/10 flex items-center justify-center cursor-pointer overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 flex flex-col items-center space-y-2">
                    <Eye className="w-8 h-8 text-white/70 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
                    <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors">Panel {i}</span>
                  </div>
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((j) => (
                        <motion.div
                          key={j}
                          className={`w-1.5 h-1.5 rounded-full ${
                            j === 0 ? 'bg-purple-400' : j === 1 ? 'bg-pink-400' : 'bg-cyan-400'
                          }`}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: j * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Demo Story Caption */}
            <div className="text-center">
              <p className="text-gray-300 mb-2">
                <span className="font-semibold text-purple-400">Story:</span> "A brave banana astronaut explores the
                mysteries of space"
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  Generated in 45s
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-red-400" />
                  4.9/5 rating
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoGallery;

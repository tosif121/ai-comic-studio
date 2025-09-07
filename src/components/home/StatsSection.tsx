'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Star, Zap, Sparkles, Users, Clock, Heart } from 'lucide-react';

const StatsSection: React.FC = () => {
  const stats = [
    {
      value: '50K+',
      label: 'Comics Created',
      icon: Palette,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      value: '98%',
      label: 'User Satisfaction',
      icon: Star,
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      value: '45s',
      label: 'Avg. Generation Time',
      icon: Zap,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      value: '24/7',
      label: 'AI Available',
      icon: Sparkles,
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-black via-gray-950 to-black">
      {/* comic halftone backdrop */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:20px_20px]" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h3 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 drop-shadow-lg mb-3">
            Our Achievements
          </h3>
          <p className="text-lg text-gray-400">
            Discover why <span className="text-purple-400">creators</span> love our AI comic studio
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.08, rotate: -1 }}
              className="group text-center relative"
            >
              <div className="relative bg-black/40 border border-white/10 rounded-2xl p-8 shadow-xl backdrop-blur-sm overflow-hidden transition-all duration-300 group-hover:shadow-purple-500/30">
                {/* glow hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`}
                />

                {/* Icon */}
                <motion.div
                  className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${stat.gradient} mb-4 shadow-lg relative z-10`}
                  whileHover={{ rotate: 10, scale: 1.15 }}
                  transition={{ duration: 0.3 }}
                >
                  <stat.icon className="w-7 h-7 text-white" />
                </motion.div>

                {/* Value */}
                <motion.div
                  className="text-3xl font-extrabold text-white mb-1 relative z-10"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {stat.value}
                </motion.div>

                {/* Label */}
                <div className="text-gray-300 text-sm relative z-10">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom extra stats */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-14 pt-8 border-t border-white/10"
        >
          <div className="flex items-center space-x-2 text-gray-300 text-sm">
            <Users className="w-4 h-4 text-green-400" />
            <span>1000+ Active Users</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-300 text-sm">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Real-time Generation</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-300 text-sm">
            <Heart className="w-4 h-4 text-red-400" />
            <span>Made with AI Love</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;

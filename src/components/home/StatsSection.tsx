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
    <section className="py-16">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white mb-2">Trusted by Creators</h3>
          <p className="text-gray-400">Join thousands who are already creating amazing comics</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group text-center"
            >
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 relative overflow-hidden">
                {/* Background gradient on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />

                <motion.div
                  className={`inline-flex p-3 rounded-2xl bg-gradient-to-r ${stat.gradient} mb-4`}
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </motion.div>

                <motion.div
                  className="text-3xl font-bold text-white mb-1"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {stat.value}
                </motion.div>

                <div className="text-gray-400 text-sm relative z-10">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center space-x-8 mt-12 pt-8 border-t border-white/10"
        >
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <Users className="w-4 h-4 text-green-400" />
            <span>1000+ Active Users</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Real-time Generation</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <Heart className="w-4 h-4 text-red-400" />
            <span>Made with AI Love</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;

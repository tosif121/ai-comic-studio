'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Users, Zap, Palette } from 'lucide-react';

const FeatureCards: React.FC = () => {
  const features = [
    {
      icon: Mic,
      title: 'Voice Input',
      desc: 'Speak your story naturally and let AI bring it to life.',
      gradient: 'from-blue-500 via-cyan-400 to-teal-500',
    },
    {
      icon: Users,
      title: 'Consistent Characters',
      desc: 'Your hero stays true across every panel & adventure.',
      gradient: 'from-purple-500 via-fuchsia-400 to-pink-500',
    },
    {
      icon: Zap,
      title: 'Instant Generation',
      desc: 'Get a complete comic in under 60 seconds ⚡',
      gradient: 'from-yellow-400 via-orange-500 to-red-500',
    },
    {
      icon: Palette,
      title: 'AI Image Magic',
      desc: 'Nano Banana crafts stunning visuals (HD in Pro).',
      gradient: 'from-pink-500 via-rose-400 to-red-600',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative py-24 bg-gradient-to-b from-black via-gray-950 to-black">
      {/* faint background comic halftone dots */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 drop-shadow-md">
            Comic-Powered Features
          </h2>
          <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
            Everything you need to turn your wildest ideas into <span className="text-purple-400">visual stories</span>.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ scale: 1.07, rotate: -1 }}
              whileTap={{ scale: 0.98 }}
              className="group relative bg-white/5 backdrop-blur-lg border border-white/10 
                         hover:border-purple-500/50 transition-all duration-300 
                         rounded-2xl overflow-hidden p-6 text-center shadow-lg"
            >
              {/* Glow overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
              />

              {/* Icon */}
              <motion.div
                className={`inline-flex p-5 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-6 shadow-lg`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <feature.icon className="w-10 h-10 text-white" />
              </motion.div>

              {/* Text */}
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureCards;

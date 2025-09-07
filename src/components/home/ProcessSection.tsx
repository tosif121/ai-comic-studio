'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { MessageSquare, Wand2, Image, Download } from 'lucide-react';

interface ProcessSectionProps {
  onGetStarted?: () => void;
}

const ProcessSection: React.FC<ProcessSectionProps> = ({ onGetStarted }) => {
  const steps = [
    {
      icon: MessageSquare,
      title: 'Tell Your Story',
      description: 'Share your idea through voice or text. Describe characters, plot, and setting.',
      gradient: 'from-purple-500 via-pink-500 to-red-500',
    },
    {
      icon: Wand2,
      title: 'AI Magic Happens',
      description: 'Our advanced AI transforms your story into a structured comic narrative.',
      gradient: 'from-pink-500 via-cyan-400 to-blue-500',
    },
    {
      icon: Image,
      title: 'Panels Generated',
      description: 'Watch as your story comes to life with consistent characters and scenes.',
      gradient: 'from-cyan-400 via-indigo-500 to-purple-500',
    },
    {
      icon: Download,
      title: 'Share & Export',
      description: 'Download your comic or share it directly with friends and family.',
      gradient: 'from-purple-400 via-fuchsia-500 to-pink-500',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.25,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section className="relative py-24 bg-gradient-to-b from-black via-gray-950 to-black overflow-hidden">
      {/* subtle comic halftone background */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:18px_18px]" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 drop-shadow-lg">
            From Idea to Comic in Minutes
          </h2>
          <p className="text-lg text-gray-400 mt-4 max-w-2xl mx-auto leading-relaxed">
            Our AI-powered pipeline makes creating professional comics{' '}
            <span className="text-purple-400">effortless</span> and fun.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-10"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, rotate: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => index === 0 && onGetStarted?.()}
              className={`relative group ${index === 0 ? 'cursor-pointer' : ''}`}
              aria-label={`Step ${index + 1}: ${step.title}`}
            >
              <div
                className={`relative bg-black/40 border border-white/10 rounded-2xl p-8 shadow-xl overflow-hidden 
                transition-all duration-500 group-hover:shadow-purple-500/30`}
              >
                {/* glow border */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`}
                />

                {/* Icon */}
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} mb-6 relative z-10 shadow-lg`}
                >
                  <step.icon className="w-8 h-8 text-white" />
                </div>

                {/* Text */}
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-300 leading-relaxed text-sm">{step.description}</p>
                </div>

                {/* Connector arrows */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gradient-to-r from-purple-400/60 to-transparent transform -translate-y-1/2">
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-purple-400 rounded-full" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ProcessSection;

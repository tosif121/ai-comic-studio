'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Users, Zap } from 'lucide-react';

const FeatureCards: React.FC = () => {
  const features = [
    { icon: Mic, title: 'Voice Input', desc: 'Speak your story naturally', gradient: 'from-blue-500 to-cyan-500' },
    { icon: Users, title: 'Consistent Characters', desc: 'Same hero across all panels', gradient: 'from-purple-500 to-pink-500' },
    { icon: Zap, title: 'Instant Generation', desc: 'Comics ready in 60 seconds', gradient: 'from-yellow-500 to-orange-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {features.map((feature, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.2 }}
          whileHover={{ scale: 1.05, y: -10 }}
          className="group relative bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-500 rounded-2xl overflow-hidden p-8 text-center"
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
          <motion.div
            className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-6`}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            <feature.icon className="w-8 h-8 text-white" />
          </motion.div>
          <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
          <p className="text-gray-400">{feature.desc}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default FeatureCards;

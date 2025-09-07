'use client';

import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import HeroSection from '@/components/home/HeroSection';
import FeatureCards from '@/components/home/FeatureCards';
import DemoGallery from '@/components/home/DemoGallery';
import StatsSection from '@/components/home/StatsSection';
import StoryForm from '@/components/forms/StoryForm';
import { AppContext } from '@/context/AppContext';

export default function Home() {
  const {
    currentView,
    setCurrentView,
    dailyUsage,
    setDailyUsage,
    isProUser,
    setShowPricingModal,
  } = useContext(AppContext);

  const handleComicGenerated = (comic: any) => {
    setCurrentView('output');
    setDailyUsage((prev) => prev + 1);
  };

  const checkUsageLimit = () => {
    if (!isProUser && dailyUsage >= 2) {
      setShowPricingModal(true);
      return false;
    }
    return true;
  };

  return (
    <div>
      {currentView === 'home' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <HeroSection onCreateComic={() => setCurrentView('form')} />
          <FeatureCards />
          <DemoGallery />
          <StatsSection />
        </motion.div>
      )}

      {currentView === 'form' && (
        <StoryForm
          onStoryGenerated={handleComicGenerated}
          canGenerate={checkUsageLimit}
        />
      )}

      {currentView === 'output' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <h2 className="text-4xl font-bold text-white mb-4">🎉 Comic Ready!</h2>
          <p className="text-gray-400 mb-8">Your AI-generated comic will appear here</p>
          <div className="space-x-4">
            <button
              onClick={() => setCurrentView('form')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 hover:scale-105"
            >
              Create Another
            </button>
            <button
              onClick={() => setCurrentView('home')}
              className="border border-white/20 text-white hover:bg-white/10 px-6 py-3 rounded-2xl transition-all duration-300"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

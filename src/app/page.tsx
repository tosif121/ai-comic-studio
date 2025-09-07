'use client';

import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import HeroSection from '@/components/home/HeroSection';
import FeatureCards from '@/components/home/FeatureCards';
import DemoGallery from '@/components/home/DemoGallery';
import StatsSection from '@/components/home/StatsSection';
import StoryForm from '@/components/forms/StoryForm';
import ComicOutput from '@/components/output/ComicOutput';
import { AppContext } from '@/context/AppContext';

export default function Home() {
  const { currentView, setCurrentView, dailyUsage, setDailyUsage, isProUser, setShowPricingModal } =
    useContext(AppContext);

  const [generatedComic, setGeneratedComic] = useState<any>(null);

  const handleComicGenerated = (comic: any) => {
    setGeneratedComic(comic);
    setCurrentView('output');
    setDailyUsage((prev) => prev + 1);
  };

  const handleCreateAnother = () => {
    setGeneratedComic(null);
    setCurrentView('form');
  };

  const handleUpgrade = () => {
    setShowPricingModal(true);
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <HeroSection onCreateComic={() => setCurrentView('form')} />
          <FeatureCards />
          <DemoGallery />
          <StatsSection />
        </motion.div>
      )}

      {currentView === 'form' && <StoryForm onStoryGenerated={handleComicGenerated} canGenerate={checkUsageLimit} />}

      {currentView === 'output' && generatedComic && (
        <ComicOutput
          comic={generatedComic}
          onCreateAnother={handleCreateAnother}
          isProUser={isProUser}
          onUpgrade={handleUpgrade}
        />
      )}
    </div>
  );
}

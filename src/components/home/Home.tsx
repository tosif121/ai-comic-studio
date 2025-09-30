'use client';

import React, { useContext, useState } from 'react';
import { motion, AnimatePresence, Variant, Variants } from 'framer-motion';
import HeroSection from '@/components/home/HeroSection';
import FeatureCards from '@/components/home/FeatureCards';
import ProcessSection from '@/components/home/ProcessSection';
import StatsSection from '@/components/home/StatsSection';
import StoryForm from '@/components/forms/StoryForm';
import ComicOutput from '@/components/output/ComicOutput';
import { AppContext } from '@/context/AppContext';

const viewVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
};

export default function Home() {
  const { currentView, setCurrentView } = useContext(AppContext);

  const [generatedComic, setGeneratedComic] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleComicGenerated = (comic: any) => {
    setIsLoading(true);
    setTimeout(() => {
      setGeneratedComic(comic);
      setCurrentView('output');
      setIsLoading(false);
    }, 500);
  };

  const handleCreateAnother = () => {
    setIsLoading(true);
    setTimeout(() => {
      setGeneratedComic(null);
      setCurrentView('form');
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen">
      {/* Loader */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-purple-500 border-t-transparent rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Views */}
      <AnimatePresence mode="wait">
        {currentView === 'home' && (
          <motion.div key="home" variants={viewVariants} initial="hidden" animate="visible" exit="exit">
            <HeroSection onCreateComic={() => setCurrentView('form')} />
            <FeatureCards />
            <ProcessSection />
            <StatsSection />
          </motion.div>
        )}

        {currentView === 'form' && (
          <motion.div key="form" variants={viewVariants} initial="hidden" animate="visible" exit="exit">
            <StoryForm onStoryGenerated={handleComicGenerated} />
          </motion.div>
        )}

        {currentView === 'output' && generatedComic && (
          <motion.div key="output" variants={viewVariants} initial="hidden" animate="visible" exit="exit">
            <ComicOutput comic={generatedComic} onCreateAnother={handleCreateAnother} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

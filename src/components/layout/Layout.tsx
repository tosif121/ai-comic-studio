'use client';

import React, { useContext } from 'react';
import Header from './Header';
import Footer from './Footer';
import ApiKeyModal from '../modals/ApiKeyModal';
import AnimatedBackground from '../shared/AnimatedBackground';
import { AppContext } from '@/context/AppContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { currentView, setCurrentView, showApiKeyModal, setShowApiKeyModal } = useContext(AppContext);

  const handleShowApiKey = () => {
    setShowApiKeyModal(true);
  };

  const handleUpgrade = () => {
    setShowApiKeyModal(false);
  };

  const handleCloseApiKey = () => {
    setShowApiKeyModal(false);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background animation */}
      <AnimatedBackground density={0.8} maxSpeed={0.13} connectParticles={true} />

      <div className="relative z-10 min-h-screen flex flex-col">
        <Header currentView={currentView} setCurrentView={setCurrentView} onShowApiKey={handleShowApiKey} />

        <main className="flex-1">
          <div className="container mx-auto px-6">{children}</div>
        </main>

        <Footer />
      </div>

      <ApiKeyModal isOpen={showApiKeyModal} onClose={handleCloseApiKey} />
    </div>
  );
}

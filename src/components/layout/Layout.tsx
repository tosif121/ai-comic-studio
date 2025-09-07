'use client';

import React, { useContext } from 'react';
import Header from './Header';
import Footer from './Footer';
import PricingModal from '../modals/PricingModal';
import AnimatedBackground from '../shared/AnimatedBackground';
import { AppContext } from '@/context/AppContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { currentView, setCurrentView, dailyUsage, isProUser, setIsProUser, showPricingModal, setShowPricingModal } =
    useContext(AppContext);

  const handleShowPricing = () => {
    setShowPricingModal(true);
  };

  const handleUpgrade = () => {
    setIsProUser(true);
    setShowPricingModal(false);
  };

  const handleClosePricing = () => {
    setShowPricingModal(false);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Replace all the old background code with this single line */}
      <AnimatedBackground density={0.8} maxSpeed={0.13} connectParticles={true} />

      <div className="relative z-10 min-h-screen flex flex-col">
        <Header
          currentView={currentView}
          setCurrentView={setCurrentView}
          dailyUsage={dailyUsage}
          isProUser={isProUser}
          onShowPricing={handleShowPricing}
        />

        <main className="flex-1">
          <div className="container mx-auto px-6">{children}</div>
        </main>

        <Footer />
      </div>

      <PricingModal isOpen={showPricingModal} onClose={handleClosePricing} onUpgrade={handleUpgrade} />
    </div>
  );
}

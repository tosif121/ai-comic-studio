'use client';

import React, { createContext, useState, ReactNode } from 'react';

interface AppContextProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  dailyUsage: number;
  setDailyUsage: (usage: number | ((prev: number) => number)) => void;
  isProUser: boolean;
  setIsProUser: (pro: boolean) => void;
  showPricingModal: boolean;
  setShowPricingModal: (show: boolean) => void;
}

export const AppContext = createContext<AppContextProps>({
  currentView: 'home',
  setCurrentView: () => {},
  dailyUsage: 0,
  setDailyUsage: () => {},
  isProUser: false,
  setIsProUser: () => {},
  showPricingModal: false,
  setShowPricingModal: () => {},
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentView, setCurrentView] = useState('home');
  const [dailyUsage, setDailyUsage] = useState(0);
  const [isProUser, setIsProUser] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        dailyUsage,
        setDailyUsage,
        isProUser,
        setIsProUser,
        showPricingModal,
        setShowPricingModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

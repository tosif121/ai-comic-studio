'use client';

import React, { createContext, useState, ReactNode } from 'react';

interface AppContextProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  showApiKeyModal: boolean;
  setShowApiKeyModal: (show: boolean) => void;
}

export const AppContext = createContext<AppContextProps>({
  currentView: 'home',
  setCurrentView: () => {},
  showApiKeyModal: false,
  setShowApiKeyModal: () => {},
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentView, setCurrentView] = useState('home');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        showApiKeyModal,
        setShowApiKeyModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

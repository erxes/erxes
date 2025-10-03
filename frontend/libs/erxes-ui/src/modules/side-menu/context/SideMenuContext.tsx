import React from 'react';

interface SideMenuContextValue {
  activeTab?: string;
  setActiveTab: (activeTab?: string) => void;
}

export const SideMenuContext = React.createContext<SideMenuContextValue | null>(
  null,
);

export const useSideMenuContext = () => {
  const context = React.useContext(SideMenuContext);
  if (!context) {
    throw new Error(
      'useSideMenuContext must be used within a SideMenuContextProvider',
    );
  }
  return context;
};

import { createContext, useContext } from 'react';

export const FocusSheetContext = createContext<{
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isSidebarOpen: boolean) => void;
  activeSideTab?: string | null;
  setActiveSideTab?: (activeSideTab: string | null) => void;
  hasSidebar?: boolean;
  setHasSidebar?: (hasSidebar: boolean) => void;
} | null>(null);

export const useFocusSheet = () => {
  const context = useContext(FocusSheetContext);

  if (!context) {
    throw new Error('useFocusSheet must be used within a FocusSheetProvider');
  }

  return context;
};

/** The enclosing FocusSheet's state, or `null` outside one. */
export const useOptionalFocusSheet = () => useContext(FocusSheetContext);

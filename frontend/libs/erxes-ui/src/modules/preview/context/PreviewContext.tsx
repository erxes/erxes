import { createContext, useContext } from 'react';
import { ImperativePanelHandle } from 'react-resizable-panels';

export interface IPreviewContext {
  resizablePanelRef: React.RefObject<ImperativePanelHandle> | null;
}

export const PreviewContext = createContext<IPreviewContext | null>(null);

export const usePreviewContext = () => {
  const context = useContext(PreviewContext);
  if (!context) {
    throw new Error('usePreviewContext must be used within a PreviewProvider');
  }
  return context;
};

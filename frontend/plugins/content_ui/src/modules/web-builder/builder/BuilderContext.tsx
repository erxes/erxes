import { createContext, ReactNode, useContext } from 'react';
import { IWeb, IWebPage } from '../types';

interface BuilderContextValue {
  webId: string;
  pageId: string;
  clientPortalId: string;
  web: IWeb | null;
  page: IWebPage | null;
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

export const BuilderProvider = ({
  value,
  children,
}: {
  value: BuilderContextValue;
  children: ReactNode;
}) => (
  <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>
);

export const useBuilderContext = () => {
  const ctx = useContext(BuilderContext);
  if (!ctx) {
    throw new Error('useBuilderContext must be used inside <BuilderProvider>');
  }
  return ctx;
};

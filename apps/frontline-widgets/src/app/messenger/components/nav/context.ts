import { createContext, useContext } from 'react';
import { INavigationContextProps } from './types';

export const TabsVariantContext = createContext<INavigationContextProps | undefined>(
  undefined,
);

export const useTabsVariant = (): INavigationContextProps => {
  const context = useContext(TabsVariantContext);

  if (!context) {
    throw new Error('useTabsVariant must be used within a TabsVariantProvider');
  }

  return context;
};

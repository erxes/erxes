import { createContext, useContext } from 'react';

export type ISelectClientPortalContext = {
  value?: string;
  onSelect: (clientPortalId: string) => void;
};

export const SelectClientPortalContext =
  createContext<ISelectClientPortalContext | null>(null);

export const useSelectClientPortalContext = () => {
  const context = useContext(SelectClientPortalContext);
  if (!context) {
    throw new Error(
      'useSelectClientPortalContext must be used within a SelectClientPortalProvider',
    );
  }
  return context;
};

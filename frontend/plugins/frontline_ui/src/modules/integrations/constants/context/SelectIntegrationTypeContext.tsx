import { createContext, useContext } from 'react';

export interface ISelectIntegrationTypeContext {
  value: string | null;
  onSelect: (integrationTypeId: string) => void;
}

export const SelectIntegrationTypeContext =
  createContext<ISelectIntegrationTypeContext | null>(null);

export const useSelectIntegrationTypeContext = () => {
  const context = useContext(SelectIntegrationTypeContext);

  if (!context) {
    throw new Error(
      'useSelectIntegrationTypeContext must be used within a SelectIntegrationTypeContext',
    );
  }

  return context;
};

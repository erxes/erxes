import { useContext } from 'react';
import { ISelectPositionsContext } from '../types/Position';
import { SelectPositionsContext } from '../contexts/SelectPositionsContext';

export const useSelectPositionsContext = () => {
  const context = useContext(SelectPositionsContext);
  if (!context) {
    throw new Error(
      'useSelectPositionsContext must be used within a <SelectPositionsProvider>',
    );
  }
  return context || ({} as ISelectPositionsContext);
};

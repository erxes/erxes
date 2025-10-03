import { useContext } from 'react';
import { SelectBrandsContext } from '../contexts/SelectBrandsContext';
import { ISelectBrandsContext } from '../types/brand';

export const useSelectBrandsContext = () => {
  const context = useContext(SelectBrandsContext);

  if (!context) {
    throw new Error(
      'useSelectBrandsContext must be used within a <SelectBrandsProvider>',
    );
  }

  return context || ({} as ISelectBrandsContext);
};

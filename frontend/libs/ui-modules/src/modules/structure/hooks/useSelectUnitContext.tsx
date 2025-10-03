import { useContext } from 'react';
import { SelectUnitContext } from '../contexts/SelectUnitContext';
import { ISelectUnitContext } from '../types/Unit';

export const useSelectUnitContext = () => {
  const context = useContext(SelectUnitContext);

  return context || ({} as ISelectUnitContext);
};

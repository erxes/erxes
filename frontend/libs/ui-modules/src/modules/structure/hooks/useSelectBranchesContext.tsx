import { useContext } from 'react';
import { SelectBranchesContext } from '../contexts/SelectBranchesContext';
import { ISelectBranchesContext } from '../types/Branch';

export const useSelectBranchesContext = () => {
  const context = useContext(SelectBranchesContext);

  return context || ({} as ISelectBranchesContext);
};

import { createContext } from 'react';
import { ISelectBranchesContext } from '../types/Branch';

export const SelectBranchesContext =
  createContext<ISelectBranchesContext | null>(null);

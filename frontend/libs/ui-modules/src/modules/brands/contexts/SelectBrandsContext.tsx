import { createContext } from 'react';
import { ISelectBrandsContext } from '../types/brand';

export const SelectBrandsContext = createContext<ISelectBrandsContext | null>(
  null,
);

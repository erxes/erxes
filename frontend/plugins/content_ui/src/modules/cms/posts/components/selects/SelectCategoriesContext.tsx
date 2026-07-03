import { createContext } from 'react';
import { ISelectCategoriesContext } from './category';

export const SelectCategoriesContext =
  createContext<ISelectCategoriesContext | null>(null);

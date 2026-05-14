import { createContext } from 'react';
import { ISelectCategoriesContext } from '../types/category';

export const SelectCategoriesContext =
  createContext<ISelectCategoriesContext | null>(null);

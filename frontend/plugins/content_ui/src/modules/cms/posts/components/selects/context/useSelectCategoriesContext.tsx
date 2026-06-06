import { useContext } from 'react';
import { SelectCategoriesContext } from './SelectCategoriesContext';
import { ISelectCategoriesContext } from '../types/category';

export const useSelectCategoriesContext = () => {
  const context = useContext(SelectCategoriesContext);

  return context || ({} as ISelectCategoriesContext);
};

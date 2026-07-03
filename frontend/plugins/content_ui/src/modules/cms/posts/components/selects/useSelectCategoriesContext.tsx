import { useContext } from 'react';
import { SelectCategoriesContext } from './SelectCategoriesContext';
import { ISelectCategoriesContext } from './category';

export const useSelectCategoriesContext = () => {
  const context = useContext(SelectCategoriesContext);

  return context || ({} as ISelectCategoriesContext);
};

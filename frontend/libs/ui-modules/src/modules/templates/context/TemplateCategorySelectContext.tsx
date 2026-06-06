import { createContext, Dispatch, SetStateAction, useContext } from 'react';
import { TemplateCategory } from '../types';

export type ISelectCategoryContext = {
  categoryIds: string[];
  onSelect: (category: TemplateCategory | null) => void;
  categories: TemplateCategory[];
  setCategories: Dispatch<SetStateAction<TemplateCategory[]>>;
  loading: boolean;
};

export const SelectCategoryContext =
  createContext<ISelectCategoryContext | null>(null);

export const useSelectCategoryContext = () => {
  const context = useContext(SelectCategoryContext);
  if (!context) {
    throw new Error(
      'useSelectCategoryContext must be used within a SelectCategoryProvider',
    );
  }
  return context;
};

import { createContext, Dispatch, SetStateAction, useContext } from 'react';
import { TemplateCategory } from '../types';

export interface ITemplateCategoryInlineContext {
  categories: TemplateCategory[];
  loading: boolean;
  categoryIds?: string[];
  placeholder: string;
  updateCategories?: Dispatch<SetStateAction<TemplateCategory[]>>;
}

export const TemplateCategoryInlineContext =
  createContext<ITemplateCategoryInlineContext | null>(null);

export const useTemplateCategoryInlineContext = () => {
  const context = useContext(TemplateCategoryInlineContext);

  if (!context) {
    throw new Error(
      'useTemplateCategoryInlineContext must be used within a TemplateCategoryInlineProvider',
    );
  }

  return context;
};

import { useMemo } from 'react';
import { useCategories } from './useCategories';
import { ICategory } from '../types/category';

export const useCategoryDetail = (categoryId?: string): ICategory | null => {
  const { categories } = useCategories();

  return useMemo(() => {
    if (!categoryId) return null;
    return categories.find((cat: ICategory) => cat._id === categoryId) || null;
  }, [categories, categoryId]);
};

import { MutationHookOptions } from '@apollo/client';

export interface ICategory {
  _id: string;
  title: string;
  code: string;
  parentId?: string;
  order: string;
  userCount?: number;
}

export interface ISelectCategoriesContext {
  selectedCategories: ICategory[];
  setSelectedCategories: (Categories: ICategory[]) => void;
  value?: string[] | string;
  onSelect: (Categories: ICategory) => void;
  newCategoryName: string;
  setNewCategoryName: (CategoryName: string) => void;
  mode: 'single' | 'multiple';
  categoryIds?: string[];
  clientPortalId?: string;
}
export type ISelectCategoriesProviderProps = {
  targetIds?: string[];
  value?: string[] | string;
  onValueChange?: (Categories?: string[] | string) => void;
  mode?: 'single' | 'multiple';
  categoryIds?: string[];
  clientPortalId?: string;
  children?: React.ReactNode;
  options?: (newSelectedCategoryIds: string[]) => MutationHookOptions<
    {
      CategoriesMain: {
        totalCount: number;
        list: ICategory[];
      };
    },
    any
  >;
};

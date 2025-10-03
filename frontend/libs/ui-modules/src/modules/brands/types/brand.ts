import { MutationHookOptions, OperationVariables } from '@apollo/client';
import React from 'react';

export interface IBrand {
  _id: string;
  name?: string;
  code?: string;
}

export interface SelectBrandFetchMoreProps {
  fetchMore: () => void;
  brandsLength: number;
  totalCount: number;
}

export interface BrandsInlineProps {
  brandIds?: string[];
  brands?: IBrand[];
  placeholder?: string;
  updateBrands?: (brands: IBrand[]) => void;
}

export interface ISelectBrandsContext {
  selectedBrands: IBrand[];
  setSelectedBrands: (brands: IBrand[]) => void;
  value: string[] | string;
  onSelect: (brand: IBrand) => void;
  newBrandName: string;
  setNewBrandName: (brandName: string) => void;
  mode: 'single' | 'multiple';
  disableCreateOption?: boolean;
}

export type ISelectBrandsProviderProps = {
  children: React.ReactNode;
  value: string[] | string;
  onValueChange?: (brands?: string[] | string) => void;
  mode?: 'single' | 'multiple';
  disableCreateOption?: boolean;
  options?: (newSelectedBrandIds: string[]) => MutationHookOptions<
    {
      brands: {
        totalCount: number;
        list: IBrand[];
      };
    },
    OperationVariables
  >;
};

export interface SelectBrandsProps {
  selected?: string[];
  onSelect?: (brands: string[]) => void;
  loading?: boolean;
  recordId: string;
  fieldId?: string;
  showAddButton?: boolean;
  asTrigger?: boolean;
  display?: () => React.ReactNode;
  inDetail?: boolean;
  disableCreateOption?: boolean;
}

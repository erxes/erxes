import { useMemo } from 'react';
import { useProductFieldTypes } from '@/products/constants/productFieldTypes';
import { PRODUCT_NAVIGATION_ICONS } from '@/products/constants/productNavigationConfig';
import { ProductsPath } from '@/types/paths/ProductsPath';
import type { ComponentType } from 'react';

export interface IProductNavigationItem {
  path: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export function useProductNavigationItems(): IProductNavigationItem[] {
  const fieldTypes = useProductFieldTypes();

  return useMemo(
    () =>
      fieldTypes.map((item) => ({
        path: item.value,
        label: item.label,
        icon: PRODUCT_NAVIGATION_ICONS[item.value as ProductsPath],
      })),
    [fieldTypes],
  );
}

export function getCurrentProductPage(
  pathname: string,
  items: IProductNavigationItem[],
): IProductNavigationItem {
  const matches = items
    .filter((item) => pathname.startsWith(item.path))
    .sort((a, b) => b.path.length - a.path.length);

  return matches[0] ?? items[0];
}

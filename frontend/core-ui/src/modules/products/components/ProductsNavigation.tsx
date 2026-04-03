import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import {
  getCurrentProductPage,
  useProductNavigationItems,
} from '@/products/hooks/useProductNavigationItems';
import { ProductsBreadcrumb } from '@/products/components/ProductsBreadcrumb';

export const ProductsNavigation = () => {
  const { pathname } = useLocation();
  const navigationItems = useProductNavigationItems();

  const currentPage = useMemo(
    () => getCurrentProductPage(pathname, navigationItems),
    [pathname, navigationItems],
  );

  return <ProductsBreadcrumb currentPage={currentPage} />;
};

import {
  useIsMatchingLocation,
  useQueryState,
  useSetHotkeyScope,
} from 'erxes-ui';

import { PRODUCT_QUERY_KEY } from './constants/productQueryKey';
import { ProductHotKeyScope } from './types/ProductsHotKeyScope';
import { ProductsPath } from '@/types/paths/ProductsPath';
import { useEffect } from 'react';

export const ProductsPageEffect = () => {
  const isMatchingLocation = useIsMatchingLocation(ProductsPath.Products);
  const [productId] = useQueryState<string>(PRODUCT_QUERY_KEY);
  const setHotkeyScope = useSetHotkeyScope();

  useEffect(() => {
    if (isMatchingLocation(ProductsPath.Index)) {
      if (productId) {
        setHotkeyScope(ProductHotKeyScope.ProductEditSheet);
      } else {
        setHotkeyScope(ProductHotKeyScope.ProductsPage);
      }
    }
  }, [isMatchingLocation, setHotkeyScope, productId]);

  return <></>;
};

import { ProductsPath } from '@/types/paths/ProductsPath';
import {
  useIsMatchingLocation,
  useQueryState,
  useSetHotkeyScope,
} from 'erxes-ui';
import { useEffect } from 'react';
import { ProductHotKeyScope } from './types/ProductsHotKeyScope';
import { PRODUCT_QUERY_KEY } from './constants/productQueryKey';

export const ProductsPageEffect = () => {
  const isMatchingLocation = useIsMatchingLocation(ProductsPath.Index);
  const [productId] = useQueryState<string>(PRODUCT_QUERY_KEY);
  const setHotkeyScope = useSetHotkeyScope();

  useEffect(() => {
    console.log('isMatchingLocation', isMatchingLocation('/'), productId);
    if (isMatchingLocation('/')) {
      if (productId) {
        setHotkeyScope(ProductHotKeyScope.ProductEditSheet);
      } else {
        setHotkeyScope(ProductHotKeyScope.ProductsPage);
      }
    }
  }, [isMatchingLocation, setHotkeyScope]);

  return <></>;
};

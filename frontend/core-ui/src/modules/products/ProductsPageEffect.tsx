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
  const isMatchingLocation = useIsMatchingLocation(ProductsPath.Products);
  const [productId] = useQueryState<string>(PRODUCT_QUERY_KEY);
  const setHotkeyScope = useSetHotkeyScope();

  useEffect(() => {
    console.log(
      'isMatchingLocation',
      isMatchingLocation(ProductsPath.Index),
      productId,
    );
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

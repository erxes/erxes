import { ProductsPath } from '@/types/paths/ProductsPath';
import {
  useIsMatchingLocation,
  useQueryState,
  useSetHotkeyScope,
} from 'erxes-ui';
import { useEffect } from 'react';
import { ProductHotKeyScope } from './types/ProductsHotKeyScope';

export const ProductsPageEffect = () => {
  const isMatchingLocation = useIsMatchingLocation(ProductsPath.Index);
  const [productId] = useQueryState<string>('productId');
  const setHotkeyScope = useSetHotkeyScope();

  useEffect(() => {
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

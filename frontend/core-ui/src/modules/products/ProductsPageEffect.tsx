import { useIsMatchingLocation, useSetHotkeyScope } from 'erxes-ui';

import { ProductHotKeyScope } from './types/ProductsHotKeyScope';
import { ProductsPath } from '@/types/paths/ProductsPath';
import { useEffect } from 'react';

export const ProductsPageEffect = () => {
  const isMatchingLocation = useIsMatchingLocation();
  const setHotkeyScope = useSetHotkeyScope();

  // The product list's own shortcuts (`c` adds a product). A product opens
  // in the side panel, which keeps its own scope.
  useEffect(() => {
    if (isMatchingLocation(ProductsPath.Products)) {
      setHotkeyScope(ProductHotKeyScope.ProductsPage);
    }
  }, [isMatchingLocation, setHotkeyScope]);

  return <></>;
};

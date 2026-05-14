import { useLocation } from 'react-router';

import { CHECK_PRODUCTS_CURSOR_SESSION_KEY } from '~/modules/erkhet-sync/check-products/constants/checkProductsCursorSessionKey';
import { CheckProductPath } from '~/modules/erkhet-sync/check-products/types/path/checkProduct';

export const useCheckProductLeadSessionKey = () => {
  const { pathname } = useLocation();

  const isCheckProduct = pathname.includes(CheckProductPath.Index);

  return {
    isCheckProduct,
    sessionKey: CHECK_PRODUCTS_CURSOR_SESSION_KEY,
  };
};

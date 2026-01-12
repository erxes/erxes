import { useLocation } from 'react-router';

import { CHECK_POS_ORDERS_CURSOR_SESSION_KEY } from '~/modules/erkhet-sync/check-pos-orders/constants/checkPosOrdersCursorSessionKey';
import { CheckPosOrdersPath } from '~/modules/erkhet-sync/check-pos-orders/types/path/checkPosOrders';

export const useCheckPosOrdersLeadSessionKey = () => {
  const { pathname } = useLocation();

  const isPos = pathname.includes(CheckPosOrdersPath.Index);

  return {
    isPos,
    sessionKey: CHECK_POS_ORDERS_CURSOR_SESSION_KEY,
  };
};

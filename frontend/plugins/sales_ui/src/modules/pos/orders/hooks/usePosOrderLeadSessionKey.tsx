import { useLocation } from 'react-router';
import { PosOrderPath } from '~/modules/pos/orders/types/path/PosOrder';
import { POS_ORDER_CURSOR_SESSION_KEY } from '../constants/posOrderCursorSessionKey';

export const usePosOrderLeadSessionKey = () => {
  const { pathname } = useLocation();

  const isPosOrder = pathname.includes(PosOrderPath.Index);

  return {
    isPosOrder,
    sessionKey: POS_ORDER_CURSOR_SESSION_KEY,
  };
};

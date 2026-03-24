import { useLocation } from 'react-router';
import { PosOrderBySubsPath } from '~/modules/pos/pos-order-by-subsription/types/path/PosOrderBySubs';
import { POS_ORDER_BY_SUBS_CURSOR_SESSION_KEY } from '../constants/posOrderBySubsCursorSessionKey';

export const usePosOrderBySubsLeadSessionKey = () => {
  const { pathname } = useLocation();

  const isPosOrderBySubs = pathname.includes(PosOrderBySubsPath.Index);

  return {
    isPosOrderBySubs,
    sessionKey: POS_ORDER_BY_SUBS_CURSOR_SESSION_KEY,
  };
};

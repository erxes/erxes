import { useLocation } from 'react-router';

import { PosPath } from '../../types/path/PosPath';
import {
  LEADS_CURSOR_SESSION_KEY,
  POS_CURSOR_SESSION_KEY,
} from '../../constants/PosCursorSessionKey';

export const useIsPosItemsLeadSessionKey = () => {
  const { pathname } = useLocation();
  const isLead = new RegExp(`(^|/)${PosPath.Leads}(/|$)`).test(pathname);
  return {
    isLead,
    sessionKey: isLead ? LEADS_CURSOR_SESSION_KEY : POS_CURSOR_SESSION_KEY,
  };
};

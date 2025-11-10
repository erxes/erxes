import { useLocation } from 'react-router-dom';
import { PosPath } from '@/pos/types/path/PosPath';
import {
  LEADS_CURSOR_SESSION_KEY,
  POS_CURSOR_SESSION_KEY,
} from '@/pos/constants/PosCursorSessionKey';

export const useIsPosLeadSessionKey = () => {
  const { pathname } = useLocation();
  const isLead = new RegExp(`(^|/)${PosPath.Leads}(/|$)`).test(pathname);
  return {
    isLead,
    sessionKey: isLead ? LEADS_CURSOR_SESSION_KEY : POS_CURSOR_SESSION_KEY,
  };
};

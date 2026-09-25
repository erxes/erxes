import { useLocation } from 'react-router';
import { AdjustClosingPath } from '../types/adjustClosingPath';
import {
  ADJUST_CLOSING_CURSOR_SESSION_KEY,
  LEADS_CURSOR_SESSION_KEY,
} from '../graphql/adjustClosingCursorSessionKey';

export const useIsAdjustClosingLeadSessionKey = () => {
  const { pathname } = useLocation();

  const isLead = pathname.includes(AdjustClosingPath.Leads);

  return {
    isLead,
    sessionKey: isLead
      ? LEADS_CURSOR_SESSION_KEY
      : ADJUST_CLOSING_CURSOR_SESSION_KEY,
  };
};

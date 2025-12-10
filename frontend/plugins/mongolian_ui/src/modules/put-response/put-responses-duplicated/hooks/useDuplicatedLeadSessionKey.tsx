import { useLocation } from 'react-router';
import { PutResponsePath } from '@/put-response/types/path/PutResponse';
import {
  LEADS_CURSOR_SESSION_KEY,
  DUPLICATED_CURSOR_SESSION_KEY,
} from '@/put-response/put-responses-duplicated/constants/DuplicatedCursorSessionKey';

export const useDuplicatedLeadSessionKey = () => {
  const { pathname } = useLocation();
  const isLead = pathname.includes(PutResponsePath.Index);

  return {
    isLead,
    sessionKey: isLead
      ? DUPLICATED_CURSOR_SESSION_KEY
      : LEADS_CURSOR_SESSION_KEY,
  };
};

import { useLocation } from 'react-router';
import { PutResponsePath } from '~/modules/ebarimt/put-response/types/path/PutResponse';
import {
  LEADS_CURSOR_SESSION_KEY,
  PUT_RESPONSE_CURSOR_SESSION_KEY,
} from '../constants/putResponseCursorSessionKey';

export const usePutResponseLeadSessionKey = () => {
  const { pathname } = useLocation();

  const isLead = pathname.includes(PutResponsePath.Index);

  return {
    isLead,
    sessionKey: isLead
      ? PUT_RESPONSE_CURSOR_SESSION_KEY
      : LEADS_CURSOR_SESSION_KEY,
  };
};

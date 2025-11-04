import { useLocation } from 'react-router';
import { LEADS_CURSOR_SESSION_KEY } from '@/put-response/constants/putResponseCursorSessionKey';
import { BY_DATE_CURSOR_SESSION_KEY } from '@/by-date/constants/ByDateCursorSessionKey';
import { PutResponsePath } from '@/types/path/PutResponse';

export const useByDateLeadSessionKey = () => {
  const { pathname } = useLocation();

  const isLead = pathname.includes(PutResponsePath.Index);

  return {
    isLead,
    sessionKey: isLead ? BY_DATE_CURSOR_SESSION_KEY : LEADS_CURSOR_SESSION_KEY,
  };
};

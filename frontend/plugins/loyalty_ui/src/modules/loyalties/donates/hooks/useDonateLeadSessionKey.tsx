import { useLocation } from 'react-router';
import { DonatePath } from '~/modules/loyalties/donates/types/path/Donate';
import { DONATE_CURSOR_SESSION_KEY } from '../constants/donateCursorSessionKey';

export const useDonateLeadSessionKey = () => {
  const { pathname } = useLocation();

  const isDonate = pathname.includes(DonatePath.Index);

  return {
    isDonate,
    sessionKey: DONATE_CURSOR_SESSION_KEY,
  };
};

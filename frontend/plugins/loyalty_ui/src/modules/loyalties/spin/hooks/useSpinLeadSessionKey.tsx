import { useLocation } from 'react-router';
import { SpinPath } from '~/modules/loyalties/spin/types/path/Spin';
import { SPIN_CURSOR_SESSION_KEY } from '../constants/spinCursorSessionKey';

export const useSpinLeadSessionKey = () => {
  const { pathname } = useLocation();

  const isSpin = pathname.includes(SpinPath.Index);

  return {
    isSpin,
    sessionKey: SPIN_CURSOR_SESSION_KEY,
  };
};

import { useLocation } from 'react-router';
import { PosItemsPath } from '../types/path/PosItems';
import { POS_ITEMS_CURSOR_SESSION_KEY } from '../constants/posItemsCursorSessionKey';

export const usePosItemsLeadSessionKey = () => {
  const { pathname } = useLocation();

  const isPosItems = pathname.includes(PosItemsPath.Index);

  return {
    isPosItems,
    sessionKey: POS_ITEMS_CURSOR_SESSION_KEY,
  };
};

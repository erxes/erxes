import { useLocation } from 'react-router';
import { PosByItemsPath } from '~/modules/pos/pos-by-items/types/path/PosByItems';
import { POS_BY_ITEMS_CURSOR_SESSION_KEY } from '../constants/posByItemsCursorSessionKey';

export const usePosByItemsLeadSessionKey = () => {
  const { pathname } = useLocation();

  const isPosByItems = pathname.includes(PosByItemsPath.Index);

  return {
    isPosByItems,
    sessionKey: POS_BY_ITEMS_CURSOR_SESSION_KEY,
  };
};

import { useLocation } from 'react-router';

import { CHECK_CATEGORY_CURSOR_SESSION_KEY } from '~/modules/erkhet-sync/check-category/constants/checkCategoryCursorSessionKey';
import { CheckCategoryPath } from '~/modules/erkhet-sync/check-category/types/path/checkCategory';

export const useCheckCategoryLeadSessionKey = () => {
  const { pathname } = useLocation();

  const isCheckCategory = pathname.includes(CheckCategoryPath.Index);

  return {
    isCheckCategory,
    sessionKey: CHECK_CATEGORY_CURSOR_SESSION_KEY,
  };
};

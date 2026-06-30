import { useLocation } from 'react-router';

import {
  getMSDynamicSessionKey,
  MSDynamicTab,
} from '~/modules/msdynamic/constants/msDynamicSessionKey';

const PATH_SEGMENT_TO_TAB: Record<string, MSDynamicTab> = {
  syncHistory: 'syncHistory',
  syncedOrders: 'syncedOrders',
  categories: 'categories',
  products: 'products',
  prices: 'prices',
  customers: 'customers',
};

const detectTabFromPathname = (pathname: string): MSDynamicTab => {
  const segment = pathname.split('/').pop() ?? '';
  return PATH_SEGMENT_TO_TAB[segment] ?? 'syncHistory';
};

export const useMSDynamicSessionKey = (tab?: MSDynamicTab) => {
  const { pathname } = useLocation();

  const currentTab = tab ?? detectTabFromPathname(pathname);

  return {
    sessionKey: getMSDynamicSessionKey(currentTab),
    tab: currentTab,
  };
};

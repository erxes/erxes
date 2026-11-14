import { useQueryState } from 'erxes-ui';
import { useAtomValue } from 'jotai';

import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { useDealIdOverride } from '@/deals/context/DealIdContext';

export const useCurrentDealId = () => {
  const [salesItemId] = useQueryState<string>('salesItemId');
  const activeDealId = useAtomValue(dealDetailSheetState);
  const overrideId = useDealIdOverride();

  return overrideId || salesItemId || activeDealId || '';
};

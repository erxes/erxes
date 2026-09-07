import { useQueryState } from 'erxes-ui';
import { useAtomValue } from 'jotai';

import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';

export const useCurrentDealId = () => {
  const [salesItemId] = useQueryState<string>('salesItemId');
  const activeDealId = useAtomValue(dealDetailSheetState);

  return salesItemId || activeDealId || '';
};

import { useMultiQueryState } from 'erxes-ui';

export type TPosLoyaltyFilterState = {
  search?: string;
  pos?: string[];
  userId?: string;
  customerId?: string;
};

export const POS_LOYALTY_FILTER_KEYS: (keyof TPosLoyaltyFilterState)[] = [
  'search',
  'pos',
  'userId',
  'customerId',
];

/** The page's filters as the POS loyalty queries take them. */
export const usePosLoyaltyVariables = () => {
  const [queries] = useMultiQueryState<TPosLoyaltyFilterState>(
    POS_LOYALTY_FILTER_KEYS,
  );
  const { search, pos, userId, customerId } = queries || {};

  return {
    search: search || undefined,
    posIds: pos?.length ? pos : undefined,
    userId: userId || undefined,
    customerId: customerId || undefined,
  };
};

import { useQuery } from '@apollo/client';
import { LOYALTY_TIER_LOGS } from '../graphql';
import { ILoyaltyTierLog } from '../types';

const LIMIT = 100;

/** Tier changes of one account or made by one record, newest first. */
export const useLoyaltyTierLogs = ({
  accountId,
  targetId,
  skip,
  pollInterval,
}: {
  accountId?: string;
  targetId?: string;
  skip?: boolean;
  pollInterval?: number;
}) => {
  const { data, loading, error, refetch } = useQuery<{
    loyaltyTierLogs?: ILoyaltyTierLog[];
  }>(LOYALTY_TIER_LOGS, {
    variables: { accountId, targetId, limit: LIMIT },
    skip: skip || (!accountId && !targetId),
    fetchPolicy: 'cache-and-network',
    pollInterval,
  });

  return {
    logs: data?.loyaltyTierLogs || [],
    loading: loading && !data,
    error,
    refetch: () => refetch(),
  };
};

export type TTierLogSource =
  | 'automation'
  | 'reset'
  | 'purchase'
  | 'purchase-of'
  | 'manual';

// What moved the tier: a period reset, an automation, a sale, or a person.
export const tierLogSource = (log: ILoyaltyTierLog): TTierLogSource => {
  if (log.createdVia?.source === 'wallet') {
    return 'reset';
  }

  if (log.createdVia?.source === 'automation') {
    return 'automation';
  }

  if (log.targetId) {
    // Lines written before the record's name was kept say only "a purchase".
    return log.targetName ? 'purchase-of' : 'purchase';
  }

  return 'manual';
};

// A removed tier keeps its key in the log; show that rather than nothing.
export const tierLogTierName = (log: ILoyaltyTierLog, key?: string | null) =>
  key
    ? log.accountType?.tiers?.find((tier) => tier.key === key)?.name || key
    : null;

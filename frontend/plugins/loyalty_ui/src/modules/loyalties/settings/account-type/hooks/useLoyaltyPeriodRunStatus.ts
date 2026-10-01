import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { LOYALTY_PERIOD_RUN_STATUS } from '../graphql/loyaltyAccountTypeQueries';

export type TLoyaltyPeriodRun = {
  _id: string;
  startedAt: string;
  finishedAt?: string;
  status: 'running' | 'done' | 'failed';
  batches: number;
  released: number;
  expired: number;
  reset: number;
  failed: number;
  error?: string;
  // Whole seconds the run took; none while it is still running.
  seconds?: number | null;
};

type TLoyaltyPeriodRunStatus = {
  nextRunAt?: string | null;
  timeZone: string;
  preview?: {
    releasing: number;
    expiring: number;
    resets: {
      accountTypeId: string;
      name: string;
      boundary: string;
      accounts: number;
    }[];
  } | null;
  runs: TLoyaltyPeriodRun[];
};

const secondsOf = ({ startedAt, finishedAt }: TLoyaltyPeriodRun) =>
  finishedAt
    ? Math.max(
        0,
        Math.round(
          (new Date(finishedAt).getTime() - new Date(startedAt).getTime()) /
            1000,
        ),
      )
    : null;

export const useLoyaltyPeriodRunStatus = () => {
  const { t } = useTranslation('loyalty');
  const { data, loading, error } = useQuery<{
    loyaltyPeriodRunStatus: TLoyaltyPeriodRunStatus;
  }>(LOYALTY_PERIOD_RUN_STATUS, { fetchPolicy: 'cache-and-network' });

  const status = data?.loyaltyPeriodRunStatus;
  const runs = (status?.runs || []).map((run) => ({
    ...run,
    seconds: secondsOf(run),
  }));

  return {
    loading: loading && !status,
    // Without the status nothing can be said about runs, not even that
    // there are none.
    error: !status ? error : undefined,
    nextRunAt: status?.nextRunAt ? new Date(status.nextRunAt) : null,
    timeZone: status?.timeZone,
    preview: status?.preview,
    resetsLabel: (status?.preview?.resets || [])
      .map(({ name, accounts }) =>
        t('period-run-reset-item', { name, count: accounts }),
      )
      .join(', '),
    runs,
    lastRun: runs[0],
  };
};

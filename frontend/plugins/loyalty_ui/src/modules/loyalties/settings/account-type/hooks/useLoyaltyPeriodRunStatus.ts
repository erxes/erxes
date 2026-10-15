import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { compactList } from '@/loyalties/utils/cursorList';
import type { LoyaltyPeriodRunStatusQuery } from '~/gql/graphql';
import { LOYALTY_PERIOD_RUN_STATUS } from '../graphql/loyaltyAccountTypeQueries';

type TPeriodRunStatus = NonNullable<
  LoyaltyPeriodRunStatusQuery['loyaltyPeriodRunStatus']
>;

const RUN_STATUSES = ['running', 'done', 'failed'] as const;

const secondsOf = (startedAt: string, finishedAt?: string | null) =>
  finishedAt
    ? Math.max(
        0,
        Math.round(
          (new Date(finishedAt).getTime() - new Date(startedAt).getTime()) /
            1000,
        ),
      )
    : null;

const toRuns = (runs: TPeriodRunStatus['runs'] | undefined) =>
  compactList(runs).flatMap(({ _id, startedAt, ...run }) =>
    _id && startedAt
      ? [
          {
            ...run,
            _id,
            startedAt,
            status:
              RUN_STATUSES.find((status) => status === run.status) ?? 'failed',
            batches: run.batches ?? 0,
            released: run.released ?? 0,
            expired: run.expired ?? 0,
            reset: run.reset ?? 0,
            failed: run.failed ?? 0,
            seconds: secondsOf(startedAt, run.finishedAt),
          },
        ]
      : [],
  );

export type TLoyaltyPeriodRun = ReturnType<typeof toRuns>[number];

export const useLoyaltyPeriodRunStatus = () => {
  const { t } = useTranslation('loyalty');
  const { data, loading, error } = useQuery(LOYALTY_PERIOD_RUN_STATUS, {
    fetchPolicy: 'cache-and-network',
  });

  const status = data?.loyaltyPeriodRunStatus;
  const runs = toRuns(status?.runs);

  return {
    loading: loading && !status,
    // Without the status nothing can be said about runs, not even that
    // there are none.
    error: !status ? error : undefined,
    nextRunAt: status?.nextRunAt ? new Date(status.nextRunAt) : null,
    timeZone: status?.timeZone ?? undefined,
    preview: status?.preview,
    resetsLabel: compactList(status?.preview?.resets)
      .map(({ name, accounts }) =>
        t('period-run-reset-item', { name, count: accounts ?? 0 }),
      )
      .join(', '),
    runs,
    lastRun: runs[0],
  };
};

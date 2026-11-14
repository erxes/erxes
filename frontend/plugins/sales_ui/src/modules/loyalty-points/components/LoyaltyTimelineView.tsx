import { IconAlertTriangle } from '@tabler/icons-react';
import { Button, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TPeriod, TTimelineInterval } from '../summary';
import { LoyaltyPanel } from './LoyaltyInsightSections';
import {
  LoyaltyFlowChart,
  LoyaltyIntervalToggle,
  LoyaltyRunningNetChart,
} from './LoyaltyTimelineSections';

export type TLoyaltyTimelineProps = {
  interval: TTimelineInterval;
  changeInterval: (interval: TTimelineInterval) => void;
  loading: boolean;
  error?: Error;
  refetch: () => unknown;
  periods: TPeriod[];
  isEmpty: boolean;
};

/** What a source moved per day, week or month, and its running net. */
export const LoyaltyTimelineView = ({
  interval,
  changeInterval,
  loading,
  error,
  refetch,
  periods,
  isEmpty,
}: TLoyaltyTimelineProps) => {
  const { t } = useTranslation('sales');

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-destructive">
        <IconAlertTriangle className="size-4" />
        {t('loyalty-timeline-error', 'Could not load the points over time')}
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          {t('retry', 'Try again')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <LoyaltyIntervalToggle
        interval={interval}
        changeInterval={changeInterval}
      />
      {loading ? (
        <Skeleton className="h-72 w-full" />
      ) : isEmpty ? (
        <div className="rounded-lg border bg-background px-3 py-8 text-center text-sm text-muted-foreground">
          {t(
            'loyalty-timeline-empty',
            'No points moved in this period. Try a longer one.',
          )}
        </div>
      ) : (
        // The flow is the point; the running net only shows its direction.
        <div className="grid gap-3 lg:grid-cols-3">
          <LoyaltyPanel
            className="lg:col-span-2"
            title={t('loyalty-timeline-flow', 'Points moved per period')}
          >
            <LoyaltyFlowChart
              periods={periods}
              interval={interval}
              className="h-64"
            />
          </LoyaltyPanel>
          <LoyaltyPanel
            title={t(
              'loyalty-timeline-cumulative',
              'Running net of these records (not a wallet balance)',
            )}
          >
            <LoyaltyRunningNetChart periods={periods} className="h-64" />
          </LoyaltyPanel>
        </div>
      )}
    </div>
  );
};

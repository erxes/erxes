import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityLogs } from 'ui-modules';
import {
  ScrollArea,
  parseDateRangeFromString,
  useMultiQueryState,
} from 'erxes-ui';
import { dealCustomActivities } from './DealActivityRows';
import { DealNoteComposer } from '@/deals/cards/components/detail/overview/DealNoteComposer';
import {
  DealActivityFilter,
  DEAL_ACTIVITY_ACTIVITY_TYPE,
  DEAL_ACTIVITY_FILTER_KEYS,
  DEAL_ACTIVITY_NOTE_TYPE,
} from './overview/activity/DealActivityFilter';

const INITIAL_ACTIVITY_LIMIT = 5;

export const DealActivityTab = ({ dealId }: { dealId: string }) => {
  const { t } = useTranslation('sales');
  const [{ activityType, activityDate }] = useMultiQueryState<{
    activityType: string;
    activityDate: string;
  }>(DEAL_ACTIVITY_FILTER_KEYS);

  const range = useMemo(
    () => parseDateRangeFromString(activityDate),
    [activityDate],
  );

  // null while the first page is still loading, so the filter bar can show a
  // skeleton instead of a premature "0 records found".
  const [totalCount, setTotalCount] = useState<number | null>(null);

  useEffect(() => {
    setTotalCount(null);
  }, [dealId, activityType, activityDate]);

  const activityLimit =
    totalCount && totalCount > INITIAL_ACTIVITY_LIMIT
      ? totalCount
      : INITIAL_ACTIVITY_LIMIT;

  return (
    <div className="h-full flex flex-col">
      <div className="w-full xl:max-w-6xl mx-auto px-6 pt-3">
        <DealActivityFilter recordCount={totalCount} />
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <div className="w-full xl:max-w-6xl mx-auto px-6 pt-3">
          <ActivityLogs
            targetId={dealId}
            customActivities={dealCustomActivities}
            variant="backward"
            activityType={
              activityType === DEAL_ACTIVITY_NOTE_TYPE
                ? DEAL_ACTIVITY_NOTE_TYPE
                : undefined
            }
            excludeActivityType={
              activityType === DEAL_ACTIVITY_ACTIVITY_TYPE
                ? DEAL_ACTIVITY_NOTE_TYPE
                : undefined
            }
            dateFrom={range?.from?.toISOString()}
            dateTo={range?.to?.toISOString()}
            onTotalCountChange={setTotalCount}
            limit={activityLimit}
            emptyMessage={t('no-activity-logs-found')}
          />
        </div>
      </ScrollArea>

      {!!dealId && (
        <div className="shrink-0 w-full xl:max-w-6xl mx-auto px-6 pb-6 pt-2">
          <DealNoteComposer key={dealId} dealId={dealId} />
        </div>
      )}
    </div>
  );
};

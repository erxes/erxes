import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityLogs } from 'ui-modules';
import { Button } from 'erxes-ui';

import { dealCustomActivities } from '@/deals/cards/components/detail/DealActivityRows';

const ACTIVITY_PREVIEW_LIMIT = 5;

export const DealOverviewActivity = ({ dealId }: { dealId: string }) => {
  const { t } = useTranslation('sales');
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const activityLimit =
    showAll && totalCount && totalCount > ACTIVITY_PREVIEW_LIMIT
      ? totalCount
      : ACTIVITY_PREVIEW_LIMIT;

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-medium">{t('activity')}</h4>
      <ActivityLogs
        targetId={dealId}
        customActivities={dealCustomActivities}
        variant="backward"
        limit={activityLimit}
        onTotalCountChange={setTotalCount}
        emptyMessage={t('no-activity-logs-found')}
      />
      {!showAll &&
        totalCount !== null &&
        totalCount > ACTIVITY_PREVIEW_LIMIT && (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="bg-muted hover:bg-muted"
              onClick={() => setShowAll(true)}
            >
              {t('view-more-activities')}
            </Button>
          </div>
        )}
    </div>
  );
};

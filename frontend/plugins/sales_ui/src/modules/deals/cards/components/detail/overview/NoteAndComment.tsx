import { dealCustomActivities } from '@/deals/cards/components/detail/DealActivityRows';
import { Button, Separator, useQueryState } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityLogs, AddInternalNote } from 'ui-modules';

const ACTIVITY_PREVIEW_LIMIT = 5;

export const SalesNoteAndComment = ({ dealId }: { dealId: string }) => {
  const { t } = useTranslation('sales');
  const [, setSelectedTab] = useQueryState<string>('tab');
  const [totalCount, setTotalCount] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-medium">{t('activity')}</h4>
        <ActivityLogs
          targetId={dealId}
          customActivities={dealCustomActivities}
          variant="forward"
          limit={ACTIVITY_PREVIEW_LIMIT}
          onTotalCountChange={setTotalCount}
          emptyMessage={t('no-activity-logs-found')}
        />
        {totalCount !== null && totalCount > ACTIVITY_PREVIEW_LIMIT && (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="bg-muted hover:bg-muted"
              onClick={() => setSelectedTab('activity')}
            >
              {t('view-more-activities')}
            </Button>
          </div>
        )}
      </div>
      <Separator className="mt-1" />
      <AddInternalNote contentTypeId={dealId} contentType="sales:deal" />
    </div>
  );
};

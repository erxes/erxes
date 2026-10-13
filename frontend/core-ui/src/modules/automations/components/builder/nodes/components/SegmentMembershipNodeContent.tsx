import { IconChartPie } from '@tabler/icons-react';
import { Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSegmentDetail } from 'ui-modules';

/** The segment whose entries and exits start this flow. */
export const SegmentMembershipNodeContent = ({
  segmentId,
}: {
  segmentId?: string;
}) => {
  const { t } = useTranslation('automations');
  const { segment, segmentLoading } = useSegmentDetail(segmentId);

  return (
    <div className="mt-2 flex items-center gap-2 rounded border bg-muted px-2 py-1.5 text-xs">
      <IconChartPie className="size-4 shrink-0 text-muted-foreground" />
      {segmentLoading ? (
        <Skeleton className="h-4 w-24" />
      ) : (
        <span className="truncate font-medium">
          {segment?.name || t('segment-membership-missing')}
        </span>
      )}
    </div>
  );
};

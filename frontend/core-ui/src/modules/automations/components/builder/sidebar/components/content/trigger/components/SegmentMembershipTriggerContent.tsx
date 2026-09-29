import { NodeData } from '@/automations/types';
import { IconChartPie, IconExternalLink } from '@tabler/icons-react';
import { Button, Label, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useSegmentDetail } from 'ui-modules';

/**
 * The segment is a shared one, so it is shown rather than edited here: its
 * definition belongs to the segment page, and changing it changes every flow
 * that listens to it.
 */
export const SegmentMembershipTriggerContent = ({
  activeNode,
}: {
  activeNode: NodeData;
}) => {
  const { t } = useTranslation('automations');
  const segmentId = activeNode.config?.segmentId;
  const { segment, segmentLoading } = useSegmentDetail(segmentId);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <Label>{t('segment-membership-segment')}</Label>
        <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
          <IconChartPie className="size-4 shrink-0 text-muted-foreground" />
          {segmentLoading ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            <span className="flex-1 truncate">
              {segment?.name || t('segment-membership-missing')}
            </span>
          )}
          {segment && (
            <Button variant="ghost" size="icon" asChild>
              <Link
                to={`/segments?contentType=${encodeURIComponent(
                  segment.contentType,
                )}&segmentId=${segment._id}`}
              >
                <IconExternalLink />
              </Link>
            </Button>
          )}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        {t('segment-membership-hint')}
      </p>
    </div>
  );
};

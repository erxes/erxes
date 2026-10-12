import { SegmentAutomationCreateButton } from '@/segments/components/SegmentAutomationCreateButton';
import { SegmentBroadcastCreateButton } from '@/segments/components/SegmentBroadcastCreateButton';
import { useSegmentAutomationCreate } from '@/segments/hooks/useSegmentAutomationCreate';
import { useSegmentAutomations } from '@/segments/hooks/useSegmentAutomations';
import { useSegmentBroadcasts } from '@/segments/hooks/useSegmentBroadcasts';
import { IconBolt, IconChevronRight, IconSend } from '@tabler/icons-react';
import { Badge, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ISegment } from 'ui-modules';

export const SegmentAutomations = ({ segment }: { segment?: ISegment }) => {
  const { t } = useTranslation('segment', { keyPrefix: 'detail' });
  const { automations, loading } = useSegmentAutomations(segment);
  const { broadcasts, loading: broadcastsLoading } =
    useSegmentBroadcasts(segment);
  const { editPath } = useSegmentAutomationCreate(segment);
  const isLoading = loading || broadcastsLoading;
  const isEmpty = !automations.length && !broadcasts.length;

  return (
    <div className="flex flex-col gap-4 p-6 max-w-2xl">
      <div>
        <h3 className="text-sm font-semibold">{t('automations-title')}</h3>
        <p className="text-sm text-muted-foreground">{t('automations-hint')}</p>
      </div>
      {isLoading && <Skeleton className="h-9 w-full" />}
      {!isLoading && isEmpty && (
        <p className="text-sm text-muted-foreground">
          {t('automations-empty')}
        </p>
      )}
      <div className="flex flex-col gap-2">
        {automations.map(({ _id, name, status }) => (
          <Link
            key={_id}
            to={editPath(_id)}
            className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent"
          >
            <IconBolt className="size-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 truncate">{name || _id}</span>
            <span className="text-xs text-muted-foreground">
              {t('automation-kind')}
            </span>
            <Badge variant={status === 'active' ? 'success' : 'secondary'}>
              {status || 'draft'}
            </Badge>
            <IconChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
        {broadcasts.map(({ _id, title, isLive, isDraft, scheduleDate }) => (
          <Link
            key={_id}
            to={`/broadcasts?messageId=${_id}`}
            className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent"
          >
            <IconSend className="size-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 truncate">{title || _id}</span>
            <span className="text-xs text-muted-foreground">
              {scheduleDate?.type === 'afterSegment'
                ? t('broadcast-kind-nightly')
                : t('broadcast-kind')}
            </span>
            <Badge variant={isLive ? 'success' : 'secondary'}>
              {isLive ? 'active' : isDraft ? 'draft' : 'paused'}
            </Badge>
            <IconChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>
      {!isLoading && (
        <div className="flex gap-2 self-start">
          <SegmentAutomationCreateButton segment={segment} />
          <SegmentBroadcastCreateButton segment={segment} />
        </div>
      )}
    </div>
  );
};

import { SegmentAutomationCreateButton } from '@/segments/components/SegmentAutomationCreateButton';
import { SegmentBroadcastCreateButton } from '@/segments/components/SegmentBroadcastCreateButton';
import { useSegmentAutomationCreate } from '@/segments/hooks/useSegmentAutomationCreate';
import { useSegmentAutomations } from '@/segments/hooks/useSegmentAutomations';
import { useSegmentBroadcasts } from '@/segments/hooks/useSegmentBroadcasts';
import { IconBolt, IconChevronRight, IconSend } from '@tabler/icons-react';
import { Badge, Skeleton } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ISegment } from 'ui-modules';

type TSegmentFlowRow = {
  key: string;
  to: string;
  icon: ReactNode;
  name: string;
  kind: string;
  status: string;
  live: boolean;
};

const SegmentFlowRow = ({
  to,
  icon,
  name,
  kind,
  status,
  live,
}: TSegmentFlowRow) => (
  <Link
    to={to}
    className="group flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent"
  >
    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
      {icon}
    </span>
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="truncate font-medium">{name}</span>
      <span className="text-xs text-muted-foreground">{kind}</span>
    </span>
    <Badge variant={live ? 'success' : 'secondary'} className="capitalize">
      {status}
    </Badge>
    <IconChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
  </Link>
);

export const SegmentAutomations = ({ segment }: { segment?: ISegment }) => {
  const { t } = useTranslation('segment', { keyPrefix: 'detail' });
  const { automations, loading } = useSegmentAutomations(segment);
  const { broadcasts, loading: broadcastsLoading } =
    useSegmentBroadcasts(segment);
  const { editPath } = useSegmentAutomationCreate(segment);
  const isLoading = loading || broadcastsLoading;

  const rows: TSegmentFlowRow[] = [
    ...automations.map(({ _id, name, status }) => ({
      key: _id,
      to: editPath(_id),
      icon: <IconBolt className="size-4" />,
      name: name || _id,
      kind: t('automation-kind'),
      status: status || 'draft',
      live: status === 'active',
    })),
    ...broadcasts.map(({ _id, title, isLive, isDraft, scheduleDate }) => ({
      key: _id,
      to: `/broadcasts?messageId=${_id}`,
      icon: <IconSend className="size-4" />,
      name: title || _id,
      kind:
        scheduleDate?.type === 'afterSegment'
          ? t('broadcast-kind-nightly')
          : t('broadcast-kind'),
      status: isLive ? 'active' : isDraft ? 'draft' : 'paused',
      live: !!isLive,
    })),
  ];

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-xl">
          <h3 className="text-sm font-semibold">{t('automations-title')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('automations-hint')}
          </p>
        </div>
        {!isLoading && (
          <div className="flex shrink-0 items-center gap-1">
            <SegmentAutomationCreateButton segment={segment} size="sm" />
            <SegmentBroadcastCreateButton segment={segment} size="sm" />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="divide-y rounded-lg border">
          {[0, 1].map((index) => (
            <div key={index} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="size-8 rounded-md" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-3.5 w-48" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : rows.length ? (
        <div className="divide-y overflow-hidden rounded-lg border">
          {rows.map(({ key, ...row }) => (
            <SegmentFlowRow key={key} {...row} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-10 text-center">
          <IconBolt className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {t('automations-empty')}
          </p>
        </div>
      )}
    </div>
  );
};

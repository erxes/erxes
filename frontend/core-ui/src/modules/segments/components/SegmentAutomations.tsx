import { SegmentAutomationCreateButton } from '@/segments/components/SegmentAutomationCreateButton';
import { useSegmentAutomations } from '@/segments/hooks/useSegmentAutomations';
import { IconBolt, IconChevronRight } from '@tabler/icons-react';
import { Badge, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ISegment } from 'ui-modules';

export const SegmentAutomations = ({ segment }: { segment?: ISegment }) => {
  const { t } = useTranslation('segment', { keyPrefix: 'detail' });
  const { automations, loading } = useSegmentAutomations(segment);

  return (
    <div className="flex flex-col gap-4 p-6 max-w-2xl">
      <div>
        <h3 className="text-sm font-semibold">{t('automations-title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('automations-hint')}
        </p>
      </div>
      {loading && <Skeleton className="h-9 w-full" />}
      {!loading && !automations.length && (
        <p className="text-sm text-muted-foreground">
          {t('automations-empty')}
        </p>
      )}
      <div className="flex flex-col gap-2">
        {automations.map(({ _id, name, status }) => (
          <Link
            key={_id}
            to={`/automations/edit/${_id}`}
            className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent"
          >
            <IconBolt className="size-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 truncate">{name || _id}</span>
            <Badge variant={status === 'active' ? 'success' : 'secondary'}>
              {status || 'draft'}
            </Badge>
            <IconChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>
      {!loading && (
        <div className="self-start">
          <SegmentAutomationCreateButton segment={segment} />
        </div>
      )}
    </div>
  );
};

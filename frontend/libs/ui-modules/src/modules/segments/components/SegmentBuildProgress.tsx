import {
  IconAlertTriangle,
  IconLoader2,
  IconPlayerStop,
} from '@tabler/icons-react';
import { Button, RelativeDateDisplay } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSegmentRebuild } from '../hooks/useSegmentRebuild';
import { SegmentRebuildButton } from './SegmentRebuildButton';
import { ISegment } from '../types';

export const SegmentBuildProgress = ({ segment }: { segment?: ISegment }) => {
  const { t } = useTranslation('segment', { keyPrefix: 'analytics' });
  const { stop, stopping } = useSegmentRebuild(segment?._id);

  if (!segment) {
    return null;
  }

  if (segment.status === 'failed' || segment.status === 'cancelled') {
    const stopped = segment.status === 'cancelled';

    return (
      <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm">
        <IconAlertTriangle className="size-4 shrink-0 text-destructive" />
        <span className="flex-auto">
          {stopped ? t('build-stopped') : t('build-failed')}
        </span>
        <SegmentRebuildButton segment={segment} size="sm" />
      </div>
    );
  }

  if (segment.status !== 'building') {
    return null;
  }

  const processed = segment.buildProcessed ?? 0;
  const total = segment.buildTotal;
  const percent = total
    ? Math.min(100, Math.round((processed / total) * 100))
    : null;

  return (
    <div className="space-y-2 rounded-md bg-muted px-3 py-2 text-sm">
      <div className="flex items-center gap-2">
        <IconLoader2 className="size-4 animate-spin text-primary shrink-0" />
        <span className="flex-auto tabular-nums">
          {total
            ? t('building-of', {
                count: processed,
                total: total.toLocaleString(),
                percent,
              })
            : t('building-progress', { count: processed })}
        </span>
        {segment.buildStartedAt && (
          <span className="text-muted-foreground text-xs">
            <RelativeDateDisplay.Value value={segment.buildStartedAt} isShort />
          </span>
        )}
        {/* Once asked, the build ends on its next page - which on a large
            clear can be a while. Saying so beats a button that still looks
            unpressed. */}
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className="text-destructive"
          onClick={stop}
          disabled={stopping || segment.buildCancelRequested}
        >
          <IconPlayerStop className="size-4" />
          {segment.buildCancelRequested ? t('stopping') : t('stop')}
        </Button>
      </div>
      {/* A plain bar rather than a shared primitive: erxes-ui has none, and one
          bar in one place is not a component library. */}
      {percent !== null && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-background">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
};

import { IconLoader2 } from '@tabler/icons-react';
import { RelativeDateDisplay } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ISegment } from '../types';

/**
 * A rebuild, while it is running.
 *
 * There is no percentage to show: the definition is paged through, so how many
 * members it will find is not known until it ends. What can honestly be shown
 * is that it is moving, and how far it has got - which is the difference
 * between a build that is working and one that has stalled.
 */
export const SegmentBuildProgress = ({ segment }: { segment?: ISegment }) => {
  const { t } = useTranslation('segment', { keyPrefix: 'analytics' });

  if (!segment || segment.status !== 'building') {
    return null;
  }

  return (
    <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm">
      <IconLoader2 className="size-4 animate-spin text-primary shrink-0" />
      <span className="flex-auto">
        {t('building-progress', {
          count: segment.buildProcessed ?? 0,
        })}
      </span>
      {segment.buildStartedAt && (
        <span className="text-muted-foreground text-xs">
          <RelativeDateDisplay.Value value={segment.buildStartedAt} isShort />
        </span>
      )}
    </div>
  );
};

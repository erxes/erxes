import { RelativeDateDisplay } from 'erxes-ui';
import { format } from 'date-fns';
import { useActivityLogRow } from '../hooks/useActivityLogRow';
import { TActivityLog } from '../types';
import { ActivityLogActorAvatar } from './ActivityLogActor';

interface ActivityLogRowProps {
  activity: TActivityLog;
  isLast?: boolean;
  showExactDate?: boolean;
}

export function ActivityLogRow({
  activity,
  isLast = false,
  showExactDate = false,
}: ActivityLogRowProps) {
  const activityLogRowContent = useActivityLogRow(activity);

  return (
    <div className="relative flex flex-row gap-3 pb-5">
      {!isLast && (
        <div className="absolute left-3 -translate-x-1/2 top-7 bottom-0 w-px bg-border" />
      )}

      <div className="relative z-10 shrink-0">
        <ActivityLogActorAvatar activity={activity} />
      </div>

      <div className="flex min-w-0 flex-1 items-start gap-3 pt-0.5">
        <div className="min-w-0 flex-1">{activityLogRowContent}</div>
        <div className="shrink-0 pt-0.5 text-right">
          {showExactDate ? (
            activity.createdAt ? (
              <p className="text-xs leading-6 text-muted-foreground">
                {format(new Date(activity.createdAt), 'MMM dd, yyyy HH:mm')}
              </p>
            ) : null
          ) : (
            <RelativeDateDisplay value={activity.createdAt as string} asChild>
              <p className="text-xs leading-6 text-muted-foreground">
                <RelativeDateDisplay.Value
                  value={activity.createdAt as string}
                />
              </p>
            </RelativeDateDisplay>
          )}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { RelativeDateDisplay } from 'erxes-ui';
import { TActivityLog } from '../types';
import { useActivityLog } from '../context/ActivityLogProvider';
import {
  ActivityLogActorAvatar,
  ActivityLogActorName,
} from './ActivityLogActor';
import { DefaultActivitySentence } from './DefaultActivitySentence';

interface ActivityLogRowProps {
  activity: TActivityLog;
  isLast?: boolean;
}

export function ActivityLogRow({
  activity,
  isLast = false,
}: ActivityLogRowProps) {
  const { customActivities } = useActivityLog();
  const customRenderer = customActivities?.find(
    ({ type }) => type === activity.activityType,
  );

  const defaultBody = (
    <div className="flex flex-col gap-1">
      <p className="text-sm text-foreground flex flex-row gap-1 flex-wrap">
        <DefaultActivitySentence activity={activity} />
      </p>
    </div>
  );

  return (
    <div className="relative flex flex-row gap-2 pb-6">
      {/* Timeline vertical line */}
      {!isLast && (
        <div className="absolute left-3 -translate-x-1/2 top-6 bottom-0 w-px bg-border" />
      )}

      {/* Avatar/Icon container */}
      <div className="relative z-10 shrink-0">
        <ActivityLogActorAvatar activity={activity} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5 items-center flex">
        {customRenderer ? customRenderer.render(activity) : defaultBody}
      </div>
      <div className="absolute right-0 top-0.5">
        <RelativeDateDisplay value={activity.createdAt as string} asChild>
          <p className="text-xs text-muted-foreground leading-6">
            <RelativeDateDisplay.Value value={activity.createdAt as string} />
          </p>
        </RelativeDateDisplay>
      </div>
    </div>
  );
}

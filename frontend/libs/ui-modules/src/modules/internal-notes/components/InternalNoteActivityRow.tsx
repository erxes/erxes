import { TActivityLog, ActivityLogCustomActivity } from '../../activity-logs';
import { ActivityLogs } from '../../activity-logs/components/ActivityLogs';
import { InternalNoteDisplay } from './InternalNoteDisplay';

const InternalNoteActivityRow = ({ activity }: { activity: TActivityLog }) => {
  const content = activity.metadata?.content;

  return (
    <div className="flex-1 min-w-0 flex flex-col gap-1 w-full">
      <div className="flex items-center gap-1">
        <ActivityLogs.ActorName activity={activity} />
        <span className="text-sm text-muted-foreground">added a note</span>
      </div>
      {content && (
        <div className="flex flex-col border rounded-lg min-h-14 px-4 py-3 mt-3">
          <InternalNoteDisplay content={content} />
        </div>
      )}
    </div>
  );
};

export const internalNoteCustomActivity: ActivityLogCustomActivity = {
  type: 'internalNote',
  render: (activity: TActivityLog) => (
    <InternalNoteActivityRow activity={activity} />
  ),
};

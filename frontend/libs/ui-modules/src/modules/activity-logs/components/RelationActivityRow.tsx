import { Badge } from 'erxes-ui';
import { ActivityLogCustomActivity, TActivityLog } from '../types';
import { ActivityLogActorName } from './ActivityLogActor';

type RelationChange = {
  contentType?: string;
  contentId?: string;
  text?: string;
};

const getRelationChange = (activity: TActivityLog): RelationChange => {
  const changes = activity.changes || {};

  return changes.added || changes.removed || {};
};

const getRelationLabel = ({ contentType, contentId, text }: RelationChange) => {
  if (text && text !== contentId) {
    return text;
  }

  const type = (contentType || '').split(':').pop() || 'record';

  return `Unknown ${type}`;
};

const RelationActivityRow = ({ activity }: { activity: TActivityLog }) => {
  const change = getRelationChange(activity);
  const action =
    activity.activityType === 'relation.removed' ? 'unlinked' : 'linked';

  return (
    <div className="flex-1 min-w-0 flex flex-col gap-1 w-full">
      <div className="flex items-center gap-1 flex-wrap">
        <ActivityLogActorName activity={activity} />
        <span className="text-sm text-muted-foreground">{action}</span>
        <Badge variant="secondary" className="font-medium">
          {getRelationLabel(change)}
        </Badge>
      </div>
    </div>
  );
};

export const relationCustomActivities: ActivityLogCustomActivity[] = [
  {
    type: 'relation.added',
    render: (activity: TActivityLog) => (
      <RelationActivityRow activity={activity} />
    ),
  },
  {
    type: 'relation.removed',
    render: (activity: TActivityLog) => (
      <RelationActivityRow activity={activity} />
    ),
  },
];

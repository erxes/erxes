import { Badge } from 'erxes-ui';
import {
  ActivityLogCustomActivity,
  ActivityLogs,
  TActivityLog,
} from 'ui-modules';

const CompanyTagAssignmentRow = ({ activity }: { activity: TActivityLog }) => {
  const isAdded = !!activity.changes?.added;
  const labels: string[] = isAdded
    ? activity.changes?.added?.labels || []
    : activity.changes?.removed?.labels || [];

  return (
    <div className="flex flex-wrap items-center gap-1 text-sm text-foreground">
      <ActivityLogs.ActorName activity={activity} />
      <span className="text-muted-foreground">
        {isAdded ? 'added tag' : 'removed tag'}
      </span>
      {labels.length ? (
        labels.map((label: string) => (
          <Badge key={label} variant="secondary" className="font-medium">
            {label}
          </Badge>
        ))
      ) : (
        <span className="font-medium">tag</span>
      )}
    </div>
  );
};

export const companyCustomActivities: ActivityLogCustomActivity[] = [
  {
    type: 'company.tag_added',
    render: (activity) => <CompanyTagAssignmentRow activity={activity} />,
  },
  {
    type: 'company.tag_removed',
    render: (activity) => <CompanyTagAssignmentRow activity={activity} />,
  },
];

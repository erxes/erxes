import { Badge, BlockEditorReadOnly, parseBlocks } from 'erxes-ui';
import {
  ActivityLogCustomActivity,
  ActivityLogs,
  TActivityLog,
} from 'ui-modules';

const ProductTagAssignmentRow = ({ activity }: { activity: TActivityLog }) => {
  const isAdded = activity.activityType === 'product.tag_added';
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

const ProductDescriptionRow = (activity: TActivityLog) => {
  const content = activity.changes?.current as string | undefined;

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex flex-row items-center gap-1">
        <ActivityLogs.ActorName activity={activity} />
        <span className="text-sm text-muted-foreground">
          {activity.action.description}
        </span>
      </div>
      {content ? (
        <div className="border rounded-lg px-4 py-3 mt-1">
          {parseBlocks(content) ? (
            <BlockEditorReadOnly content={content} />
          ) : (
            <p className="text-sm">{content}</p>
          )}
        </div>
      ) : null}
    </div>
  );
};

export const productCustomActivities: ActivityLogCustomActivity[] = [
  {
    type: 'product.tag_added',
    render: (activity) => <ProductTagAssignmentRow activity={activity} />,
  },
  {
    type: 'product.tag_removed',
    render: (activity) => <ProductTagAssignmentRow activity={activity} />,
  },
  {
    type: 'description_change',
    render: ProductDescriptionRow,
  },
];

import { ActivityLogs, TActivityLog } from 'ui-modules';
import { BlockEditorReadOnly } from 'erxes-ui';

export const DescriptionChangedActivityRow = (activity: TActivityLog) => {
  const { action, changes } = activity;
  const content = changes?.current as string | undefined;

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex flex-row items-center gap-1">
        <ActivityLogs.ActorName activity={activity} />
        <span className="text-sm text-muted-foreground">{action.description}</span>
      </div>
      {content ? (
        <div className="ml-0 pl-3 border-l-2 border-border bg-sidebar rounded-r-md py-1">
          <BlockEditorReadOnly content={content} className="text-sm" />
        </div>
      ) : null}
    </div>
  );
};

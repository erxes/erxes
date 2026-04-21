import { ActivityLogs, TActivityLog } from 'ui-modules';
import { BlockEditorReadOnly, parseBlocks } from 'erxes-ui';

export const DescriptionChangedActivityRow = ({
  activity,
}: {
  activity: TActivityLog;
}) => {
  const { action, changes } = activity;
  const content = changes?.current as string | undefined;

  const renderContent = () => {
    if (!content) return null;
    if (parseBlocks(content)) {
      return <BlockEditorReadOnly content={content} />;
    }
    return <p className="text-sm">{content}</p>;
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex flex-row items-center gap-1">
        <ActivityLogs.ActorName activity={activity} />
        <span className="text-sm text-muted-foreground">
          {action.description}
        </span>
      </div>
      {content ? (
        <div className="border rounded-lg px-4 py-3 mt-1">
          {renderContent()}
        </div>
      ) : null}
    </div>
  );
};

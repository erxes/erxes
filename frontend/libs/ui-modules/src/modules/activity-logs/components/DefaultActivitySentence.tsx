import { TActivityLog } from '../types';
import { ActivityLogActorName } from './ActivityLogActor';
import {
  AssignmentSentence,
  isAssignmentActivityType,
} from './AssignmentSentence';
import { FieldChangeSentence } from './FieldChangeSentence';
import {
  isPermissionGroupActivityType,
  PermissionGroupAssignmentSentence,
} from './PermissionGroupAssignmentSentence';
import { PropertiesFieldChangeSentence } from './PropertiesFieldChangeSentence';

export function DefaultActivitySentence({
  activity,
}: {
  activity: TActivityLog;
}) {
  const { activityType, metadata, action, context, contextType } =
    activity || {};
  const [entityType, eventType] = activityType.split('.');

  if (entityType === 'property' && eventType === 'field_changed') {
    return <PropertiesFieldChangeSentence activity={activity} />;
  }

  if (eventType === 'field_changed') {
    return <FieldChangeSentence activity={activity} />;
  }

  if (isAssignmentActivityType(activityType)) {
    return <AssignmentSentence activity={activity} />;
  }

  if (isPermissionGroupActivityType(activityType)) {
    return <PermissionGroupAssignmentSentence activity={activity} />;
  }

  if (eventType?.includes('custom_permission_')) {
    const isAdded = eventType.includes('added');
    const verb = isAdded ? 'added' : 'removed';
    const module = metadata?.module as string;

    return (
      <>
        <ActivityLogActorName activity={activity} />;
        <span className="text-muted-foreground">
          {verb} custom permission for
        </span>
        <span className="font-medium">{module}</span>
      </>
    );
  }

  return (
    <>
      <ActivityLogActorName activity={activity} />;
      <span className="text-muted-foreground">
        {action?.description || action?.action || 'did something'}
      </span>
      {context?.text || contextType ? (
        <span className="font-medium">{context?.text || contextType}</span>
      ) : null}
    </>
  );
}

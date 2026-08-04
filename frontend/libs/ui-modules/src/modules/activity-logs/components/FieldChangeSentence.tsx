import { TActivityLog } from '../types';
import { formatActivityValue, getChangedValue } from '../utils';
import { ActivityLogActorName } from './ActivityLogActor';

export const FieldChangeSentence = ({
  activity,
}: {
  activity: TActivityLog;
}) => {
  const { metadata, changes, action } = activity || {};

  const {
    field,
    fieldLabel = field || 'field',
    previousValueLabel,
    currentValueLabel,
  } = metadata || {};

  const previousValue = getChangedValue(changes?.prev, field);
  const currentValue = getChangedValue(changes?.current, field);
  const actionType = action?.type;

  if (actionType === 'set' && currentValue !== undefined) {
    return (
      <>
        <ActivityLogActorName activity={activity} />
        <span className="text-muted-foreground">set</span>
        <span className="font-medium">{fieldLabel.toLowerCase()}</span>
        <span className="text-muted-foreground">to</span>
        <span className="font-medium">
          {currentValueLabel || formatActivityValue(currentValue)}
        </span>
      </>
    );
  }

  if (actionType === 'unset') {
    return (
      <>
        <ActivityLogActorName activity={activity} />
        <span className="text-muted-foreground">cleared</span>
        <span className="font-medium">{fieldLabel.toLowerCase()}</span>
      </>
    );
  }

  return (
    <>
      <ActivityLogActorName activity={activity} />
      <span className="text-muted-foreground">changed</span>
      <span className="font-medium">{fieldLabel.toLowerCase()}</span>
      {previousValue !== undefined ? (
        <>
          <span className="text-muted-foreground">from</span>
          <span className="font-medium">
            {previousValueLabel || formatActivityValue(previousValue)}
          </span>
        </>
      ) : null}
      {currentValue !== undefined ? (
        <>
          <span className="text-muted-foreground">to</span>
          <span className="font-medium">
            {currentValueLabel || formatActivityValue(currentValue)}
          </span>
        </>
      ) : null}
    </>
  );
};

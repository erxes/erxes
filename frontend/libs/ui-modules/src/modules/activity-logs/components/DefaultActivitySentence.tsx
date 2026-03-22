import React from 'react';
import { TActivityLog } from '../types';
import { ActivityLogActorName } from './ActivityLogActor';
import {
  formatActivityValue,
  getChangedValue,
} from '../utils/activityLogSentence';

export function DefaultActivitySentence({
  activity,
}: {
  activity: TActivityLog;
}) {
  const actor = <ActivityLogActorName activity={activity} />;

  if (activity.activityType === 'field_change') {
    const field = activity.metadata?.field as string | undefined;
    const fieldLabel =
      (activity.metadata?.fieldLabel as string | undefined) || field || 'field';
    const previousValue = getChangedValue(activity.changes?.prev, field);
    const currentValue = getChangedValue(activity.changes?.current, field);
    const previousValueLabel = activity.metadata?.previousValueLabel as
      | string
      | undefined;
    const currentValueLabel = activity.metadata?.currentValueLabel as
      | string
      | undefined;
    const actionType = activity.action?.type;

    if (actionType === 'set' && currentValue !== undefined) {
      return (
        <>
          {actor}
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
          {actor}
          <span className="text-muted-foreground">cleared</span>
          <span className="font-medium">{fieldLabel.toLowerCase()}</span>
        </>
      );
    }

    return (
      <>
        {actor}
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
  }

  if (activity.activityType === 'assignment') {
    const entityLabel =
      (activity.metadata?.entityLabel as string | undefined) || 'item';
    const labels = activity.context?.text;
    const actionType = activity.action?.type;
    const verb = actionType === 'unassigned' ? 'removed' : actionType;

    return (
      <>
        {actor}
        <span className="text-muted-foreground">{verb}</span>
        <span className="font-medium">{entityLabel}</span>
        {labels ? <span className="font-medium">{labels}</span> : null}
      </>
    );
  }

  return (
    <>
      {actor}
      <span className="text-muted-foreground">
        {activity.action?.description ||
          activity.action?.action ||
          'did something'}
      </span>
      {activity.context?.text || activity.contextType ? (
        <span className="font-medium">
          {activity.context?.text || activity.contextType}
        </span>
      ) : null}
    </>
  );
}

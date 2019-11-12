import React from 'react';
import Task from '../containers/items/boardItems/Task';
import InternalNote from '../containers/items/InternalNote';
import { IActivityLog } from '../types';
import CreatedLog from './items/boardItems/CreatedLog';
import MovementLog from './items/boardItems/MovementLog';
import MergedLog from './items/MergedLog';

type Props = {
  activity: IActivityLog;
};

const ActivityItem = (props: Props) => {
  const { activity } = props;

  const { _id, contentType, action } = activity;

  if (contentType === 'note') {
    return <InternalNote noteId={_id} activity={activity} />;
  }

  if (contentType === 'taskDetail') {
    return <Task taskId={_id} />;
  }

  if (action && action === 'moved') {
    return <MovementLog activity={activity} />;
  }

  if (action && action === 'create') {
    return <CreatedLog activity={activity} />;
  }

  if (action && action === 'merge') {
    return <MergedLog activity={activity} />;
  }

  return <div />;
};

export default ActivityItem;

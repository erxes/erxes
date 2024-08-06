import ChecklistLog from '../../../containers/items/ChecklistLog';
import { IActivityLogItemProps } from '@erxes/ui-log/src/activityLogs/types';
import React from 'react';

class DeletedLog extends React.Component<IActivityLogItemProps> {
  render() {
    const { activity } = this.props;
    const { contentType } = activity;
    if(contentType === 'checklist')
      {
        return<ChecklistLog activity={activity} />;
      }
      return <ChecklistLog activity={activity} />;
  }
}

export default DeletedLog;

import ChecklistLog from '../containers/CheckListLog';
import { IActivityLogItemProps } from '@erxes/ui-log/src/activityLogs/types';
import React from 'react';

class DeletedLog extends React.Component<IActivityLogItemProps> {
  render() {
    const { activity } = this.props;

    return <ChecklistLog activity={activity} />;
  }
}

export default DeletedLog;

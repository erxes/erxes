import { IActivityLogItemProps } from '@erxes/ui/src/activityLogs/types';
import ChecklistLog from '../containers/CheckListLog';
import React from 'react';

class DeletedLog extends React.Component<IActivityLogItemProps> {
  render() {
    const { activity } = this.props;

    return <ChecklistLog activity={activity} />;
  }
}

export default DeletedLog;

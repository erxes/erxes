import ChecklistLog from '../../../containers/items/ChecklistLog';
import { IActivityLogItemProps } from '@erxes/ui-log/src/activityLogs/types';
import React from 'react';

class DeletedLog extends React.Component<IActivityLogItemProps> {
  render() {
    const { activity } = this.props;
    const { contentType } = activity;

    switch (contentType) {
      case 'checklist':
        return <ChecklistLog activity={activity} />;
      default:
        return <ChecklistLog activity={activity} />;
    }
  }
}

export default DeletedLog;

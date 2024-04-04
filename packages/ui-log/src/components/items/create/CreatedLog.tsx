import BoardItemCreate from './BoardItemCreate';
import ChecklistLog from '../../../containers/items/ChecklistLog';
import CustomerCreate from './CustomerCreate';
import { IActivityLogItemProps } from '@erxes/ui-log/src/activityLogs/types';
import React from 'react';

class CreatedLog extends React.Component<IActivityLogItemProps> {
  render() {
    const { activity } = this.props;
    const { contentType } = activity;

    switch (contentType) {
      case 'customer':
        return <CustomerCreate activity={activity} />;
      case 'checklist':
        return <ChecklistLog activity={activity} />;
      default:
        return <BoardItemCreate activity={activity} />;
    }
  }
}

export default CreatedLog;

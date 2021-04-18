import { IActivityLogItemProps } from 'modules/activityLogs/types';
import React from 'react';
import ChecklistLog from '../../../containers/items/ChecklistLog';
import BoardItemCreate from './BoardItemCreate';
import CustomerCreate from './CustomerCreate';

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

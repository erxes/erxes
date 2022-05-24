import { IActivityLogItemProps } from '@erxes/ui-logs/src/activityLogs/types';
import React from 'react';
import BoardItemCreatedLog from '../containers/BoardItemCreatedLog';
import CheckListLog from '../containers/CheckListLog';

class CreatedLog extends React.Component<IActivityLogItemProps> {
  render() {
    const { activity } = this.props;
    const { contentType } = activity;

    switch (contentType) {
      case 'cards:checklist':
        return <CheckListLog activity={activity} />;
      default:
        return <BoardItemCreatedLog activity={activity} />;
    }
  }
}

export default CreatedLog;

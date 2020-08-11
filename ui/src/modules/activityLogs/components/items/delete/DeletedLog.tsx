import { IActivityLog } from 'modules/activityLogs/types';
import React from 'react';
import ChecklistLog from '../../../containers/items/ChecklistLog';

type Props = {
  activity: IActivityLog;
};

class DeletedLog extends React.Component<Props> {
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

import { IActivityLogItemProps } from '@erxes/ui-logs/src/activityLogs/types';
import React from 'react';
import CompanyCreateLog from './CompanyCreateLog';
import CustomerCreateLog from './CustomerCreateLog';

class CreatedLog extends React.Component<IActivityLogItemProps> {
  render() {
    const { activity } = this.props;
    const { contentType } = activity;

    switch (contentType) {
      case 'contacts:customer':
        return <CustomerCreateLog activity={activity} />;

      default:
        return <CompanyCreateLog activity={activity} />;
    }
  }
}

export default CreatedLog;

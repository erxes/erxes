import CompanyCreateLog from './CompanyCreateLog';
import CustomerCreateLog from './CustomerCreateLog';
import { IActivityLogItemProps } from '@erxes/ui-log/src/activityLogs/types';
import React from 'react';

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

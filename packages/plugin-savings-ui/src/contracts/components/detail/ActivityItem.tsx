import { IActivityLog } from '@erxes/ui-log/src/activityLogs/types';
import React from 'react';

const renderInvoices = (activity: IActivityLog) => {
  return <div></div>;
};

const activityItem = (activity: IActivityLog) => {
  const { contentType, action } = activity;

  switch ((action && action) || contentType) {
    default:
      return renderInvoices(activity);
  }
};

export default activityItem;

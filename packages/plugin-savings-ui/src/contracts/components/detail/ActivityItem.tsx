import { IActivityLog } from '@erxes/ui-log/src/activityLogs/types';
import React from 'react';

const renderInvoices = (activity: IActivityLog) => {
  return <div></div>;
};

const activityItem = (activity: IActivityLog) => {
  const { contentType, action } = activity;

  console.log('action', action);
  console.log('contentType', contentType);

  if ((action && action) || contentType) {
    return renderInvoices(activity);
  }
};

export default activityItem;

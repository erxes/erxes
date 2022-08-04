import { IActivityLog } from '@erxes/ui-log/src/activityLogs/types';
import PerInvoice from '../../../invoices/containers/PerInvoice';
import React from 'react';

const renderInvoices = (activity: IActivityLog) => {
  return <PerInvoice key={Math.random()} activity={activity}></PerInvoice>;
};

const activityItem = (activity: IActivityLog) => {
  const { contentType, action } = activity;

  switch ((action && action) || contentType) {
    default:
      return renderInvoices(activity);
  }
};

export default activityItem;

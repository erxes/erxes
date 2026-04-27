import React from 'react';
import { ActivityLogs } from 'ui-modules';
import { useQueryState } from 'erxes-ui';

export const DealActivityTab = () => {
  const [salesItemId] = useQueryState<string>('salesItemId');

  if (!salesItemId) {
    return null;
  }

  return (
    <ActivityLogs
      targetId={salesItemId}
      emptyMessage="No activity logs found"
    />
  );
};

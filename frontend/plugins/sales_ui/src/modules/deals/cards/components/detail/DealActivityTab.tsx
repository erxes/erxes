import React from 'react';
import { ActivityLogs } from 'ui-modules';
import { useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const DealActivityTab = () => {
  const [salesItemId] = useQueryState<string>('salesItemId');
  const { t } = useTranslation('sales');

  if (!salesItemId) {
    return null;
  }

  return (
    <ActivityLogs
      targetId={salesItemId}
      emptyMessage={t('no-activity-logs-found')}
    />
  );
};

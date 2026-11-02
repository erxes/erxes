import { useApolloClient } from '@apollo/client';
import { IconRefresh } from '@tabler/icons-react';
import { Button, Spinner, Tooltip, toast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { refetchReportQueries } from '@/report/utils/reportQueries';

export const ReportsRefreshButton = () => {
  const client = useApolloClient();
  const { t } = useTranslation('frontline');
  const [refreshing, setRefreshing] = useState(false);
  const label = t('refresh-reports', 'Refresh reports');

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    try {
      await refetchReportQueries(client);
    } catch {
      toast({
        title: t('refresh-reports-error', 'Failed to refresh reports'),
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const refreshButton = (
    <Button
      variant="outline"
      size="icon"
      disabled={refreshing}
      onClick={handleRefresh}
    >
      {refreshing ? <Spinner /> : <IconRefresh />}
      <span className="sr-only">{label}</span>
    </Button>
  );

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>{refreshButton}</Tooltip.Trigger>
        <Tooltip.Content>{label}</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

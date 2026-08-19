import { Button, Spinner, Tooltip, useToast } from 'erxes-ui';
import { IconRefresh } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { useSyncFacebookPostStats } from '@/report/hooks/useFacebookReport';

interface SyncFacebookStatsButtonProps {
  pageIds?: string[];
}

export const SyncFacebookStatsButton = ({
  pageIds,
}: SyncFacebookStatsButtonProps) => {
  const { t } = useTranslation('frontline');
  const { toast } = useToast();
  const { syncFacebookPostStats, syncing } = useSyncFacebookPostStats();

  const handleSync = () => {
    syncFacebookPostStats({
      variables: { pageIds: pageIds?.length ? pageIds : undefined },
      onCompleted: (data) => {
        const result = data.reportFacebookSyncPostStats;

        if (result.errors?.length) {
          toast({
            variant: 'destructive',
            title: t('facebook-sync-partial'),
            description: result.errors
              .map((error) => `${error.pageId}: ${error.message}`)
              .join('\n'),
          });
          return;
        }

        toast({
          variant: 'success',
          title: t('facebook-sync-done'),
          description: t('facebook-sync-summary', {
            updated: result.updated,
            fetched: result.fetched,
            missing: result.missingInErxes,
          }),
        });
      },
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: t('facebook-sync-failed'),
          description: error.message,
        }),
    });
  };

  return (
    <Tooltip.Provider>
      <Tooltip delayDuration={0}>
        <Tooltip.Trigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSync}
            disabled={syncing}
            aria-label={t('facebook-sync')}
          >
            {syncing ? <Spinner size="sm" /> : <IconRefresh />}
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>{t('facebook-sync-tooltip')}</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

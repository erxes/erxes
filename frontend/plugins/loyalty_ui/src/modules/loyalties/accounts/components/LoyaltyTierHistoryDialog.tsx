import { Dialog, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useLoyaltyTierLogs } from '../hooks/useLoyaltyTierLogs';
import { LoyaltyTierLogItem } from './LoyaltyTierLogItem';

export const LoyaltyTierHistoryDialog = ({
  accountId,
  number,
  open,
  onOpenChange,
}: {
  accountId: string;
  number: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation('loyalty');
  const { logs, loading, error } = useLoyaltyTierLogs({
    accountId,
    skip: !open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <Dialog.Header>
          <Dialog.Title>{t('loyalty-tier-history')}</Dialog.Title>
          <Dialog.Description>
            {t('loyalty-tier-history-hint', { number })}
          </Dialog.Description>
        </Dialog.Header>
        {loading && <Skeleton className="h-24 w-full" />}
        {error && <p className="text-sm text-destructive">{error.message}</p>}
        {!loading && !error && !logs.length && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t('loyalty-tier-history-empty')}
          </p>
        )}
        <div className="flex flex-col gap-2">
          {logs.map((log) => (
            <LoyaltyTierLogItem key={log._id} log={log} />
          ))}
        </div>
      </Dialog.Content>
    </Dialog>
  );
};

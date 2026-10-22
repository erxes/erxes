import { IconFilterOff, IconInbox } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNotificationFilterControls } from '@/notification/hooks/useNotificationFilterControls';

export const NotificationEmptyState = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const { status, hasActiveFilters, clearFilters, setStatus } =
    useNotificationFilterControls();
  const Icon = hasActiveFilters ? IconFilterOff : IconInbox;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center text-muted-foreground">
      <div className="rounded-xl border border-primary/15 bg-primary/5 p-6">
        <Icon className="text-primary" />
      </div>
      <span className="text-sm font-medium text-foreground">
        {hasActiveFilters
          ? t('no-filter-matches')
          : status === 'unread'
          ? t('all-caught-up')
          : t('no-notifications')}
      </span>
      {hasActiveFilters ? (
        <>
          <p className="text-xs">{t('empty-filter-hint')}</p>
          <Button variant="secondary" onClick={clearFilters}>
            <IconFilterOff />
            {t('clear-filters')}
          </Button>
        </>
      ) : (
        status !== 'all' && (
          <Button variant="secondary" onClick={() => setStatus('all')}>
            <IconInbox />
            {t('view-all')}
          </Button>
        )
      )}
    </div>
  );
};

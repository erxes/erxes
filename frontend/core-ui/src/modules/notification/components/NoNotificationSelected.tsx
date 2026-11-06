import { IconInbox } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export const NoNotificationSelected = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center">
      <div className="size-24 bg-primary/5 rounded-2xl border border-primary/15 flex items-center justify-center">
        <IconInbox className="text-primary size-12" stroke={1.5} />
      </div>
      <div className="text-lg font-medium mt-5 text-foreground">
        {t('no-notification-selected')}
      </div>
      <div className="text-muted-foreground mt-2 text-sm">
        {t('select-notification')}
      </div>
    </div>
  );
};

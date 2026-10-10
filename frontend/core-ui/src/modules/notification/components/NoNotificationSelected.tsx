import { IconCircleMinus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export const NoNotificationSelected = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  return (
    <div className="h-full w-full flex flex-col items-center justify-center">
      <div className="size-24 bg-sidebar rounded-xl border border-dashed flex items-center justify-center">
        <IconCircleMinus
          className="text-accent-foreground size-12"
          stroke={1}
        />
      </div>
      <div className="text-lg font-medium mt-5 text-muted-foreground">
        {t('no-notification-selected')}
      </div>
      <div className="text-accent-foreground mt-2 text-sm">
        {t('select-notification')}
      </div>
    </div>
  );
};

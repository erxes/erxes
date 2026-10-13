import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export const UnknownSystemNotificationContent = ({
  contentType,
}: {
  contentType?: string;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  return (
    <div className="h-dvh w-full flex flex-col items-center justify-center">
      <div className="size-28 bg-sidebar rounded-2xl border border-dashed flex items-center justify-center">
        <IconInfoCircle
          size={32}
          className="text-accent-foreground"
          stroke={1}
        />
      </div>
      <div className="text-lg font-semibold mt-5 text-muted-foreground">
        {t('unknown-template')}
      </div>
      <div className=" text-accent-foreground mt-2 max-w-sm text-center">
        {t('unknown-type-description', {
          contentType: contentType || t('unknown'),
        })}
      </div>
    </div>
  );
};

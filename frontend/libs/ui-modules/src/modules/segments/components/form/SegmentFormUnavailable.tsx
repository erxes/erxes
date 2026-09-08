import { IconLock } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export const SegmentFormUnavailable = () => {
  const { t } = useTranslation('segment', { keyPrefix: 'detail' });

  return (
    <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-2 text-center">
      <IconLock className="size-6 text-muted-foreground" />
      <p className="text-sm font-medium">{t('segment-unavailable')}</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        {t('segment-unavailable-hint')}
      </p>
    </div>
  );
};

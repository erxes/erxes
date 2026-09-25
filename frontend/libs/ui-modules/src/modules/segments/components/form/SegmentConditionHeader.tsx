import { useTranslation } from 'react-i18next';

export const SegmentConditionHeader = () => {
  const { t } = useTranslation('segment', { keyPrefix: 'detail' });

  return (
    <div className="flex flex-row gap-2 px-1 pb-1 text-xs uppercase tracking-wide text-muted-foreground">
      <span className="w-[120px] shrink-0">{t('type')}</span>
      <span className="flex-1 min-w-[150px]">{t('property')}</span>
      <span className="w-[150px] shrink-0">{t('condition')}</span>
      <span className="flex-1">{t('value')}</span>
      <span className="w-9 shrink-0" />
    </div>
  );
};

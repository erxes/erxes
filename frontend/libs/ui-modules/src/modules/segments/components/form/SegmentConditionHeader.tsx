import { useTranslation } from 'react-i18next';

export const SegmentConditionHeader = ({
  withType = true,
}: {
  withType?: boolean;
}) => {
  const { t } = useTranslation('segment', { keyPrefix: 'detail' });

  return (
    <div className="flex flex-row gap-2 pb-1 text-xs uppercase tracking-wide text-muted-foreground">
      {withType && <span className="w-40 shrink-0">{t('type')}</span>}
      <span className="flex-1 min-w-[150px]">{t('property')}</span>
      <span className="w-[150px] shrink-0">{t('condition')}</span>
      <span className="flex-1 min-w-[120px]">{t('value')}</span>
      <span className="w-7 shrink-0" />
    </div>
  );
};

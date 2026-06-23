import { useTranslation } from 'react-i18next';

export const ReportFilterCond = () => {
  const { t } = useTranslation('accounting');
  return <>{t('filters')}:</>;
};

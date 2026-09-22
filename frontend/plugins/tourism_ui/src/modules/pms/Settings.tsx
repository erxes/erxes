import { useTranslation } from 'react-i18next';

const Settings = () => {
  const { t } = useTranslation('tourism');
  return (
    <div>
      <h1>{t('pms-settings')}</h1>
    </div>
  );
};

export default Settings;

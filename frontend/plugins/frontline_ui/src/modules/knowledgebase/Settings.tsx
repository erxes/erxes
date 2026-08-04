import { useTranslation } from 'react-i18next';

const Settings = () => {
  const { t } = useTranslation('frontline');
  return (
    <div>
      <h1>{t('settings')}</h1>
    </div>
  );
};

export default Settings;

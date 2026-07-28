import { useTranslation } from 'react-i18next';

const Settings = () => {
  const { t } = useTranslation('tourism');
  return (
    <div>
      <h1 className="justify-center text-center">{t('tms-settings')}</h1>
    </div>
  );
};

export default Settings;

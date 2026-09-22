import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const FBAuth = () => {
  const { t } = useTranslation('frontline');
  useEffect(() => {
    window.close();
  }, []);

  return (
    <div className="h-dvh w-dvh flex items-center justify-center text-center">
      {t('facebook-authorized')}
    </div>
  );
};

import { useNavigate } from 'react-router-dom';

import { Button } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { loadingPluginsConfigState } from 'ui-modules';
import { LoadingScreen } from '@/auth/components/LoadingScreen';
import { useTranslation } from 'react-i18next';

export const NotFoundPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('common', { keyPrefix: 'not-found' });
  const loadingPluginsConfig = useAtomValue(loadingPluginsConfigState);

  if (loadingPluginsConfig) {
    return <LoadingScreen />
  }
 

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">{t('message')}</p>
      <Button variant="link" onClick={() => navigate('/')}>
        {t('go-back')}
      </Button>
    </div>
  );
};

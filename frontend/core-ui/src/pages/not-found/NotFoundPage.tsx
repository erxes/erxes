import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { Button } from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { loadingPluginsConfigState } from 'ui-modules';
import { LoadingScreen } from '@/auth/components/LoadingScreen';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { notFoundLocationState } from '@/navigation/states/appLastLocationState';
import { getAppResumePath } from '@/navigation/utils/appLastLocation';

export const NotFoundPage = () => {
  const navigate = useNavigate();
  const { key, state } = useLocation();
  const setNotFoundLocation = useSetAtom(notFoundLocationState);
  const { t } = useTranslation('common', { keyPrefix: 'not-found' });
  const loadingPluginsConfig = useAtomValue(loadingPluginsConfigState);
  const resumePath = getAppResumePath(state);

  useEffect(() => {
    if (loadingPluginsConfig) {
      return;
    }

    setNotFoundLocation(key);
    return () => setNotFoundLocation(null);
  }, [key, loadingPluginsConfig, setNotFoundLocation]);

  if (loadingPluginsConfig) {
    return <LoadingScreen />;
  }

  if (resumePath) {
    return <Navigate to={resumePath} replace state={null} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">{t('message')}</p>
      <Button variant="link" onClick={() => navigate('/')}>
        {t('go-home', 'Go to Home')}
      </Button>
    </div>
  );
};

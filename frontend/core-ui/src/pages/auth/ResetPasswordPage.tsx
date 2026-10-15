import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { currentUserState } from 'ui-modules';

import { ResetPassword } from '@/auth/login/components/ResetPassword';
import { AppPath } from '@/types/paths/AppPath';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('common', { keyPrefix: 'auth' });

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') as string;

  const currentUser = useAtomValue(currentUserState);

  useEffect(() => {
    if (currentUser) {
      navigate(AppPath.Index);
    }
  }, [currentUser, navigate]);

  return (
    <div className="flex items-center justify-center my-48">
      <div className="motion-preset-slide-down-md grid gap-5">
        <div className="flex flex-col items-center">
          <h2 className="font-semibold text-2xl">{t('reset-password')}</h2>
        </div>
        <ResetPassword token={token} />
      </div>
    </div>
  );
};

export default ResetPasswordPage;

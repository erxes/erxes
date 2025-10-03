import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ForgotPassword } from '@/auth/login/components/ForgotPassword';
import { currentUserState } from 'ui-modules';
import { DynamicBanner } from '@/auth/components/DynamicBanner';
import { AuthenticationLayout } from '@/auth/components/AuthenticationLayout';
import { AppPath } from '@/types/paths/AppPath';
import { useAtomValue } from 'jotai';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const currentUser = useAtomValue(currentUserState);

  useEffect(() => {
    if (currentUser) {
      navigate(AppPath.Index);
    }
  }, [currentUser, navigate]);

  return (
    <div className="flex min-h-screen w-full z-10">
      <DynamicBanner />
      <AuthenticationLayout>
        <ForgotPassword />
      </AuthenticationLayout>
    </div>
  );
};

export default ForgotPasswordPage;

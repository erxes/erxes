import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Login } from '@/auth/login/components/Login';
import { currentUserState } from 'ui-modules';
import { DynamicBanner } from '@/auth/components/DynamicBanner';
import { AuthenticationLayout } from '@/auth/components/AuthenticationLayout';
import { AppPath } from '@/types/paths/AppPath';
import { useAtomValue } from 'jotai';

const LoginPage = () => {
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
        <Login />
      </AuthenticationLayout>
    </div>
  );
};

export default LoginPage;

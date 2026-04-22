import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Login } from '@/auth/login/components/Login';
import { currentUserState } from 'ui-modules';
import { DynamicBanner } from '@/auth/components/DynamicBanner';
import { AuthenticationLayout } from '@/auth/components/AuthenticationLayout';
import { AppPath } from '@/types/paths/AppPath';
import { useAtomValue } from 'jotai';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentUser = useAtomValue(currentUserState);
  const redirect = searchParams.get('redirect') || AppPath.Index;
  const safeRedirect =
    redirect.startsWith('/') && !redirect.startsWith('//')
      ? redirect
      : AppPath.Index;

  useEffect(() => {
    if (currentUser) {
      navigate(safeRedirect, { replace: true });
    }
  }, [currentUser, navigate, safeRedirect]);

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

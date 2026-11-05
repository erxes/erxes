import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useApolloClient, useMutation } from '@apollo/client';
import { currentUserState, isCurrentUserLoadedState } from 'ui-modules';

import { toast } from 'erxes-ui';

import { Logout } from '@/auth/graphql/mutations/logout';
import { ForgotPassword } from '@/auth/login/grahpql/mutations/forgotPassword';
import { Login } from '@/auth/login/grahpql/mutations/login';
import { ResetPassword } from '@/auth/login/grahpql/mutations/resetPassword';
import { AppPath } from '@/types/paths/AppPath';
import { ITwoFactorChallenge } from '@/auth/two-factor/types';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

export const useLogin = () => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const [login, { loading }] = useMutation(Login, {});
  const [logout, { loading: logoutLoading }] = useMutation(Logout);
  const [forgotPassword, { loading: forgotPasswordLoading }] =
    useMutation(ForgotPassword);
  const [resetPassword, { loading: resetPasswordLoading }] =
    useMutation(ResetPassword);
  const setCurrentUser = useSetAtom(currentUserState);
  const setIsCurrentUserLoaded = useSetAtom(isCurrentUserLoadedState);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || AppPath.Index;
  const safeRedirect =
    redirect.startsWith('/') && !redirect.startsWith('//')
      ? redirect
      : AppPath.Index;

  const client = useApolloClient();

  const finishLogin = useCallback(() => {
    setIsCurrentUserLoaded(false);
    navigate(safeRedirect, { replace: true });
  }, [navigate, safeRedirect, setIsCurrentUserLoaded]);

  const handleCrendentialsLogin = (
    {
      email,
      password,
    }: {
      email: string;
      password: string;
    },
    onTwoFactor?: (step: ITwoFactorChallenge) => void,
  ) =>
    login({
      variables: { email, password },
      onCompleted: finishLogin,
      onError(error) {
        const extensions = error.graphQLErrors[0]?.extensions;
        const reason = extensions?.reason;

        // The password was right; the server wants the second factor now
        if (
          onTwoFactor &&
          typeof extensions?.challenge === 'string' &&
          (reason === 'two_factor_required' ||
            reason === 'two_factor_setup_required')
        ) {
          onTwoFactor({
            challenge: extensions.challenge,
            setup: reason === 'two_factor_setup_required',
          });
          return;
        }

        toast({
          title: t(
            `login-failure.${
              typeof reason === 'string' ? reason : 'invalid_credentials'
            }`,
          ),
          variant: 'destructive',
        });
      },
    });

  const handleLogout = useCallback(async () => {
    await logout();
    client.resetStore();

    setIsCurrentUserLoaded(false);
    setCurrentUser(null);

    sessionStorage.clear();

    navigate(AppPath.Login);
  }, [logout, navigate, setCurrentUser, setIsCurrentUserLoaded, client]);

  const handleForgotPassword = useCallback(
    async (email: string) => {
      await forgotPassword({ variables: { email } })
        .then(() => {
          toast({
            title: t('success'),
            description: t('reset-link-sent'),
            variant: 'success',
          });
          navigate(AppPath.Login);
        })
        .catch((e) => {
          toast({
            title: t('something-went-wrong-title'),
            description: e.message,
            variant: 'destructive',
          });
        });
    },
    [forgotPassword, toast, t],
  );

  const handleResetPassword = useCallback(
    async (token: string, password: string) => {
      await resetPassword({ variables: { token, newPassword: password } })
        .then(() => {
          toast({
            title: t('success'),
            description: t('password-reset'),
            variant: 'success',
          });
        })
        .catch((e) => {
          toast({
            title: t('something-went-wrong-title'),
            description: e.message,
            variant: 'destructive',
          });
        });
    },
    [resetPassword, toast, t],
  );

  return {
    loading:
      loading || logoutLoading || forgotPasswordLoading || resetPasswordLoading,
    handleLogout,
    handleCrendentialsLogin,
    finishLogin,
    handleForgotPassword,
    handleResetPassword,
  };
};

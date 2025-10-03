import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useApolloClient, useMutation } from '@apollo/client';
import { currentUserState, isCurrentUserLoadedState } from 'ui-modules';

import { toast } from 'erxes-ui';

import { Logout } from '@/auth/graphql/mutations/logout';
import { ForgotPassword } from '@/auth/login/grahpql/mutations/forgotPassword';
import { Login } from '@/auth/login/grahpql/mutations/login';
import { ResetPassword } from '@/auth/login/grahpql/mutations/resetPassword';
import { AppPath } from '@/types/paths/AppPath';
import { useSetAtom } from 'jotai';

export const useLogin = () => {
  const [login, { loading }] = useMutation(Login, {});
  const [logout, { loading: logoutLoading }] = useMutation(Logout);
  const [forgotPassword, { loading: forgotPasswordLoading }] =
    useMutation(ForgotPassword);
  const [resetPassword, { loading: resetPasswordLoading }] =
    useMutation(ResetPassword);
  const setCurrentUser = useSetAtom(currentUserState);
  const setIsCurrentUserLoaded = useSetAtom(isCurrentUserLoadedState);

  const navigate = useNavigate();

  const client = useApolloClient();

  const handleCrendentialsLogin = ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) =>
    login({
      variables: { email, password },
      onCompleted() {
        setIsCurrentUserLoaded(false);
        navigate(AppPath.Index);
      },
      onError(error) {
        toast({
          title: 'Email or password is incorrect',
          description: error.message,
        });
      },
    });

  const handleLogout = useCallback(async () => {
    await logout();
    client.resetStore();

    setIsCurrentUserLoaded(false);
    setCurrentUser(null);

    sessionStorage.clear();
    localStorage.clear();

    navigate(AppPath.Login);
  }, [logout, navigate, setCurrentUser, setIsCurrentUserLoaded, client]);

  const handleForgotPassword = useCallback(
    async (email: string) => {
      await forgotPassword({ variables: { email } })
        .then(() => {
          toast({
            title: 'Success',
            description:
              'Password reset instructions have been sent to your email.',
          });
          navigate(AppPath.Login);
        })
        .catch((e) => {
          toast({
            title: 'Uh oh! Something went wrong.',
            description: e.message,
          });
        });
    },
    [forgotPassword, toast],
  );

  const handleResetPassword = useCallback(
    async (token: string, password: string) => {
      await resetPassword({ variables: { token, newPassword: password } })
        .then(() => {
          toast({
            title: 'Success',
            description: 'Password has been reset.',
          });
        })
        .catch((e) => {
          toast({
            title: 'Uh oh! Something went wrong.',
            description: e.message,
          });
        });
    },
    [resetPassword, toast],
  );

  return {
    loading:
      loading || logoutLoading || forgotPasswordLoading || resetPasswordLoading,
    handleLogout,
    handleCrendentialsLogin,
    handleForgotPassword,
    handleResetPassword,
  };
};

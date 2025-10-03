import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useApolloClient, useMutation } from '@apollo/client';
import {
  currentOrganizationState,
  currentUserState,
  isCurrentOrganizationLoadedState,
  isCurrentUserLoadedState,
} from 'ui-modules';
import { Logout } from '@/auth/graphql/mutations/logout';
import { AppPath } from '@/types/paths/AppPath';
import { useSetAtom } from 'jotai';

export const useAuth = () => {
  const [logout] = useMutation(Logout);
  const setCurrentUser = useSetAtom(currentUserState);
  const setIsCurrentUserLoaded = useSetAtom(isCurrentUserLoadedState);

  const setCurrentOrganization = useSetAtom(currentOrganizationState);
  const setIsCurrentOrganizationLoaded = useSetAtom(
    isCurrentOrganizationLoadedState,
  );

  const navigate = useNavigate();

  const client = useApolloClient();

  const handleLogout = useCallback(async () => {
    await logout();
    client.resetStore();

    setIsCurrentUserLoaded(false);
    setCurrentUser(null);
    setCurrentOrganization(null);
    setIsCurrentOrganizationLoaded(false);

    sessionStorage.clear();
    localStorage.clear();

    navigate(AppPath.Login);
  }, [
    logout,
    navigate,
    setCurrentUser,
    setIsCurrentUserLoaded,
    setCurrentOrganization,
    setIsCurrentOrganizationLoaded,
    client,
  ]);

  return {
    handleLogout,
  };
};

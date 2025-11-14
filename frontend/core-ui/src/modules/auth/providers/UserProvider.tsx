import { Navigate, Outlet } from 'react-router';

import { currentUserState, isCurrentUserLoadedState } from 'ui-modules';
import { isDefined } from 'erxes-ui';

import { AppPath } from '@/types/paths/AppPath';
import { useAtomValue } from 'jotai';

export const UserProvider = () => {
  const isCurrentUserLoaded = useAtomValue(isCurrentUserLoadedState);
  const hasAuthToken = window.cookieStore.get('auth-token');
  const currentUser = useAtomValue(currentUserState);

  if (!isCurrentUserLoaded) {
    return <div />;
  }

  if (!isDefined(currentUser) && !hasAuthToken) {
    return <Navigate to={AppPath.Login} replace />;
  }

  return <Outlet />;
};

import { Navigate, Outlet, useLocation } from 'react-router';

import { currentUserState, isCurrentUserLoadedState } from 'ui-modules';
import { isDefined } from 'erxes-ui';

import { AppPath } from '@/types/paths/AppPath';
import { useAtomValue } from 'jotai';

export const UserProvider = () => {
  const location = useLocation();
  const isCurrentUserLoaded = useAtomValue(isCurrentUserLoadedState);
  const currentUser = useAtomValue(currentUserState);

  if (!isCurrentUserLoaded) {
    return <div />;
  }

  if (!isDefined(currentUser)) {
    const redirect = `${location.pathname}${location.search}`;

    return (
      <Navigate
        to={`${AppPath.Login}?redirect=${encodeURIComponent(redirect)}`}
        replace
      />
    );
  }

  return <Outlet />;
};

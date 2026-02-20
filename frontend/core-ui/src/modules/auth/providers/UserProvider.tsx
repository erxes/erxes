import { Navigate, Outlet } from 'react-router-dom';

import { currentUserState, isCurrentUserLoadedState } from 'ui-modules';
import { isDefined } from 'erxes-ui';

import { AppPath } from '@/types/paths/AppPath';
import { useAtomValue } from 'jotai';

export const UserProvider = () => {
  const isCurrentUserLoaded = useAtomValue(isCurrentUserLoadedState);
  const currentUser = useAtomValue(currentUserState);

  if (!isCurrentUserLoaded) {
    return <div />;
  }

  if (!isDefined(currentUser)) {
    return <Navigate to={AppPath.Login} replace />;
  }

  return <Outlet />;
};




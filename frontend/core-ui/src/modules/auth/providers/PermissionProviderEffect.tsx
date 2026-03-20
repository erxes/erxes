import { useEffect } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { useQuery } from '@apollo/client';
import {
  currentUserPermissionsState,
  isPermissionsLoadedState,
  isCurrentUserLoadedState,
  currentUserState,
} from 'ui-modules';
import { ICurrentUserPermission } from 'ui-modules/modules/permissions/hooks/useCurrentUserPermissions';
import { CURRENT_USER_PERMISSIONS } from 'ui-modules/modules/permissions/graphql/queries/getPermissions';

export const PermissionProviderEffect = () => {
  const isCurrentUserLoaded = useAtomValue(isCurrentUserLoadedState);
  const currentUser = useAtomValue(currentUserState);
  const setPermissions = useSetAtom(currentUserPermissionsState);
  const setIsPermissionsLoaded = useSetAtom(isPermissionsLoadedState);

  const hasUser = isCurrentUserLoaded && !!currentUser;

  const { data, loading } = useQuery<{
    currentUserPermissions: ICurrentUserPermission[];
  }>(CURRENT_USER_PERMISSIONS, {
    skip: !hasUser,
  });

  useEffect(() => {
    if (!hasUser) return;
    if (loading) return;

    setPermissions(data?.currentUserPermissions ?? []);
    setIsPermissionsLoaded(true);
  }, [hasUser, loading, data, setPermissions, setIsPermissionsLoaded]);

  return null;
};

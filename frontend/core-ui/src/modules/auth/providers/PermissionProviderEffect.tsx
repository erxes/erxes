import { useEffect } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { useQuery } from '@apollo/client';
import {
  currentUserPermissionsState,
  pluginsWithPermissionsState,
  isPermissionsLoadedState,
  isCurrentUserLoadedState,
  currentUserState,
} from 'ui-modules';
import { ICurrentUserPermissionsResult } from 'ui-modules/modules/permissions/hooks/useCurrentUserPermissions';
import { CURRENT_USER_PERMISSIONS } from 'ui-modules/modules/permissions/graphql/queries/getPermissions';

export const PermissionProviderEffect = () => {
  const isCurrentUserLoaded = useAtomValue(isCurrentUserLoadedState);
  const currentUser = useAtomValue(currentUserState);
  const setPermissions = useSetAtom(currentUserPermissionsState);
  const setPluginsWithPermissions = useSetAtom(pluginsWithPermissionsState);
  const setIsPermissionsLoaded = useSetAtom(isPermissionsLoadedState);

  const hasUser = isCurrentUserLoaded && !!currentUser;

  const { data, loading } = useQuery<{
    currentUserPermissions: ICurrentUserPermissionsResult;
  }>(CURRENT_USER_PERMISSIONS, {
    skip: !hasUser,
  });

  useEffect(() => {
    if (!hasUser) return;
    if (loading) return;

    const result = data?.currentUserPermissions;
    setPermissions(result?.permissions ?? []);
    setPluginsWithPermissions(result?.pluginsWithPermissions ?? []);
    setIsPermissionsLoaded(true);
  }, [hasUser, loading, data, setPermissions, setPluginsWithPermissions, setIsPermissionsLoaded]);

  return null;
};

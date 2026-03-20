import { atom } from 'jotai';
import { ICurrentUserPermission } from 'ui-modules/modules/permissions/hooks/useCurrentUserPermissions';

export const currentUserPermissionsState = atom<
  ICurrentUserPermission[] | null
>(null);

export const isPermissionsLoadedState = atom<boolean>(false);

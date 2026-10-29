import { useMemo } from 'react';
import { MultiSelectOption } from 'erxes-ui';
import {
  useGetPermissionDefaultGroups,
  useGetPermissionGroups,
} from '@/settings/permissions/hooks/useGetPermissionGroups';

export const usePermissionGroupOptions = () => {
  const { defaultGroups, loading: defaultLoading } =
    useGetPermissionDefaultGroups();
  const { permissionGroups, loading: customLoading } = useGetPermissionGroups();

  const options = useMemo<MultiSelectOption[]>(
    () => [
      ...defaultGroups.map((group) => ({ value: group.id, label: group.name })),
      ...permissionGroups.map((group) => ({
        value: group._id,
        label: group.name,
      })),
    ],
    [defaultGroups, permissionGroups],
  );

  return { options, loading: defaultLoading || customLoading };
};

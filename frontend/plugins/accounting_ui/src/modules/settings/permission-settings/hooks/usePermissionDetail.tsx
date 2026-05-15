import { useQueryState } from 'erxes-ui';
import { usePermissionsMain } from './usePermissionsMain';

export const usePermissionDetail = () => {
  const [permissionId, setPermissionId] = useQueryState('permissionId');
  const { permissionsMain, loading } = usePermissionsMain();

  const permissionDetail = permissionId
    ? permissionsMain?.find((p) => p._id === permissionId) ?? null
    : null;

  return {
    permissionDetail,
    loading,
    closeDetail: () => setPermissionId(null),
  };
};

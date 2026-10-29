import { usePermissionCheck } from 'ui-modules';

export const useDataExtensionPermissions = () => {
  const { hasActionPermission } = usePermissionCheck();

  return {
    canManage: hasActionPermission('dataExtensionsManage'),
    canManageRecords: hasActionPermission('dataExtensionRecordsManage'),
  };
};

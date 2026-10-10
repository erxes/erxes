import { usePermissionCheck } from 'ui-modules';

// What this user may do to an account by hand; the server checks the same.
export const useLoyaltyAccountPermissions = () => {
  const { hasActionPermission } = usePermissionCheck();

  return {
    canFreeze: hasActionPermission('loyaltyAccountFreeze'),
    canSetTier: hasActionPermission('loyaltyAccountSetTier'),
  };
};

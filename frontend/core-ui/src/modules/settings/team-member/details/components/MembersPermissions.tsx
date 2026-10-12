import { MemberPermission } from '@/settings/permissions/components/MemberPermission';
import { useUserDetail } from '../../hooks/useUserDetail';
import { OwnerPermissionNotice } from './OwnerPermissionNotice';

export const MembersPermissions = () => {
  const { userDetail } = useUserDetail();

  if (userDetail?.isOwner) {
    return <OwnerPermissionNotice />;
  }
  if (!userDetail) {
    return null;
  }

  return (
    <MemberPermission
      userId={userDetail._id}
      permissionGroupIds={userDetail.permissionGroupIds}
    />
  );
};

import { MemberPermission } from '@/settings/permissions/components/MemberPermission';
import { useUserDetail } from '../../hooks/useUserDetail';

export const MembersPermissions = () => {
  const { userDetail } = useUserDetail();

  if (userDetail?.isOwner) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">
          This user is owner, no permission needed.
        </p>
      </div>
    );
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

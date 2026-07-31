import { MemberPermission } from '@/settings/permissions/components/MemberPermission';
import { useUserDetail } from '../../hooks/useUserDetail';
import { useTranslation } from 'react-i18next';

export const MembersPermissions = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { userDetail } = useUserDetail();

  if (userDetail?.isOwner) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">
          {t('owner-no-permission-needed', 'This user is owner, no permission needed.')}
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

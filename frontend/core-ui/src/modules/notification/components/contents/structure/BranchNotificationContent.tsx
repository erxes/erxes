import { useBranchDetailsById } from '@/settings/structure/hooks/useBranchDetailsById';
import { TNotification } from 'ui-modules';
import { StructureNotificationDetail } from './StructureNotificationDetail';
import { StructureUserName } from './StructureReferenceName';
import { useTranslation } from 'react-i18next';

export const BranchNotificationContent = ({
  action,
  createdAt,
  fromUser,
  contentTypeId,
}: TNotification) => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const { branchDetail, loading, error } = useBranchDetailsById({
    variables: { id: contentTypeId },
  });
  const coordinate = branchDetail?.coordinate;

  return (
    <StructureNotificationDetail
      action={action}
      error={error}
      loading={loading}
      name={branchDetail?.title}
      contentType={t('branch')}
      openLabel={t('open-branch')}
      openPath={`/settings/structures/branches?branch_id=${contentTypeId}`}
      createdAt={createdAt}
      fromUser={fromUser}
      details={[
        { label: t('code'), value: branchDetail?.code },
        { label: t('status-label'), value: branchDetail?.status },
        { label: t('address'), value: branchDetail?.address },
        { label: t('email'), value: branchDetail?.email },
        { label: t('phone-number'), value: branchDetail?.phoneNumber },
        { label: t('members'), value: branchDetail?.userCount },
        {
          label: t('supervisor'),
          value: branchDetail?.supervisorId ? (
            <StructureUserName userId={branchDetail.supervisorId} />
          ) : undefined,
        },
        {
          label: t('coordinates'),
          value:
            coordinate?.latitude != null && coordinate?.longitude != null
              ? `${coordinate.latitude}, ${coordinate.longitude}`
              : undefined,
        },
      ]}
    />
  );
};

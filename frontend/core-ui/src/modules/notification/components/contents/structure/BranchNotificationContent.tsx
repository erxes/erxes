import { useBranchDetailsById } from '@/settings/structure/hooks/useBranchDetailsById';
import { TNotification } from 'ui-modules';
import { StructureNotificationDetail } from './StructureNotificationDetail';
import { StructureUserName } from './StructureReferenceName';

export const BranchNotificationContent = ({
  action,
  createdAt,
  fromUser,
  contentTypeId,
}: TNotification) => {
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
      contentType="branch"
      createdAt={createdAt}
      fromUser={fromUser}
      details={[
        { label: 'Code', value: branchDetail?.code },
        { label: 'Status', value: branchDetail?.status },
        { label: 'Address', value: branchDetail?.address },
        { label: 'Email', value: branchDetail?.email },
        { label: 'Phone number', value: branchDetail?.phoneNumber },
        { label: 'Members', value: branchDetail?.userCount },
        {
          label: 'Supervisor',
          value: branchDetail?.supervisorId ? (
            <StructureUserName userId={branchDetail.supervisorId} />
          ) : undefined,
        },
        {
          label: 'Coordinates',
          value:
            coordinate?.latitude != null && coordinate?.longitude != null
              ? `${coordinate.latitude}, ${coordinate.longitude}`
              : undefined,
        },
      ]}
    />
  );
};

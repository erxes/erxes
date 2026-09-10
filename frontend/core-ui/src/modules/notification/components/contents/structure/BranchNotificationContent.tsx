import { useBranchDetailsById } from '@/settings/structure/hooks/useBranchDetailsById';
import { TNotification } from 'ui-modules';
import { StructureNotificationDetail } from './StructureNotificationDetail';

export const BranchNotificationContent = ({
  action,
  createdAt,
  fromUser,
  contentTypeId,
}: TNotification) => {
  const { branchDetail, loading } = useBranchDetailsById({
    variables: { id: contentTypeId },
  });
  const coordinate = branchDetail?.coordinate;

  return (
    <StructureNotificationDetail
      action={action}
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
        { label: 'Supervisor', value: branchDetail?.supervisorId },
        {
          label: 'Coordinates',
          value:
            coordinate?.latitude && coordinate?.longitude
              ? `${coordinate.latitude}, ${coordinate.longitude}`
              : undefined,
        },
      ]}
    />
  );
};

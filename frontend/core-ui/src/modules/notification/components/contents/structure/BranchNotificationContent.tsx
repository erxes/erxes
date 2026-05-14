import { useBranchDetailsById } from '@/settings/structure/hooks/useBranchDetailsById';
import { IconBuildings } from '@tabler/icons-react';
import { AssigneeNotificationContent, IUser, TNotification } from 'ui-modules';

export const BranchNotificationContent = ({
  action,
  createdAt,
  fromUser,
  contentTypeId,
}: TNotification) => {
  const { branchDetail, loading } = useBranchDetailsById({
    variables: { id: contentTypeId },
  });
  return (
    <AssigneeNotificationContent
      action={action || '-'}
      loading={loading}
      name={branchDetail?.title || '-'}
      contentType="branch"
      createdAt={createdAt}
      fromUser={fromUser || ({} as IUser)}
      Icon={IconBuildings}
    />
  );
};

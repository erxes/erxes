import { INotification } from '@/notification/my-inbox/types/notifications';
import { useBranchDetailsById } from '@/settings/structure/hooks/useBranchDetailsById';
import { IconBuildings } from '@tabler/icons-react';
import { AssigneeNotificationContent, IUser } from 'ui-modules';

export const BranchNotificationContent = ({
  action,
  createdAt,
  fromUser,
  contentTypeId,
}: INotification) => {
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

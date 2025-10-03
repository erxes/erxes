import { INotification } from '@/notification/my-inbox/types/notifications';
import { IconBuildings } from '@tabler/icons-react';
import { AssigneeNotificationContent, IUser } from 'ui-modules';
import { useDepartmentById } from 'ui-modules/modules/structure/hooks/useDepartmentById';

export const DepartmentNotificationContent = ({
  action,
  createdAt,
  fromUser,
  contentTypeId,
}: INotification) => {
  const { departmentDetail, loading } = useDepartmentById({
    variables: { id: contentTypeId },
  });
  return (
    <AssigneeNotificationContent
      action={action || '-'}
      loading={loading}
      name={departmentDetail?.title || '-'}
      contentType="department"
      createdAt={createdAt}
      fromUser={fromUser || ({} as IUser)}
      Icon={IconBuildings}
    />
  );
};

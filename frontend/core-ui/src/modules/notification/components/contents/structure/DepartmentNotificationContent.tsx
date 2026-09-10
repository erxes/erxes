import { useDepartmentDetailsById } from '@/settings/structure/hooks/useDepartmentDetailsById';
import { TNotification } from 'ui-modules';
import { StructureNotificationDetail } from './StructureNotificationDetail';

export const DepartmentNotificationContent = ({
  action,
  createdAt,
  fromUser,
  contentTypeId,
}: TNotification) => {
  const { departmentDetail, loading } = useDepartmentDetailsById({
    variables: { id: contentTypeId },
  });

  return (
    <StructureNotificationDetail
      action={action}
      loading={loading}
      name={departmentDetail?.title}
      contentType="department"
      createdAt={createdAt}
      fromUser={fromUser}
      details={[
        { label: 'Code', value: departmentDetail?.code },
        { label: 'Status', value: departmentDetail?.status },
        { label: 'Description', value: departmentDetail?.description },
        { label: 'Members', value: departmentDetail?.userCount },
        { label: 'Supervisor', value: departmentDetail?.supervisorId },
        { label: 'Parent department', value: departmentDetail?.parentId },
      ]}
    />
  );
};

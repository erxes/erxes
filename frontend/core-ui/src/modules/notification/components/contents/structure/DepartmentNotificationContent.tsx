import { useDepartmentDetailsById } from '@/settings/structure/hooks/useDepartmentDetailsById';
import { TNotification } from 'ui-modules';
import { StructureNotificationDetail } from './StructureNotificationDetail';
import {
  StructureDepartmentName,
  StructureUserName,
} from './StructureReferenceName';
import { useTranslation } from 'react-i18next';

export const DepartmentNotificationContent = ({
  action,
  createdAt,
  fromUser,
  contentTypeId,
}: TNotification) => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const { departmentDetail, loading, error } = useDepartmentDetailsById({
    variables: { id: contentTypeId },
  });

  return (
    <StructureNotificationDetail
      action={action}
      error={error}
      loading={loading}
      name={departmentDetail?.title}
      contentType={t('department')}
      openLabel={t('open-department')}
      openPath={`/settings/structures/departments?department_id=${contentTypeId}`}
      createdAt={createdAt}
      fromUser={fromUser}
      details={[
        { label: t('code'), value: departmentDetail?.code },
        { label: t('status-label'), value: departmentDetail?.status },
        { label: t('description'), value: departmentDetail?.description },
        { label: t('members'), value: departmentDetail?.userCount },
        {
          label: t('supervisor'),
          value: departmentDetail?.supervisorId ? (
            <StructureUserName userId={departmentDetail.supervisorId} />
          ) : undefined,
        },
        {
          label: t('parent-department'),
          value: departmentDetail?.parentId ? (
            <StructureDepartmentName departmentId={departmentDetail.parentId} />
          ) : undefined,
        },
      ]}
    />
  );
};

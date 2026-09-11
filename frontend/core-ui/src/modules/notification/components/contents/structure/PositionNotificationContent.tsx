import { usePositionDetailsById } from '@/settings/structure/hooks/usePositionDetailsById';
import { TNotification } from 'ui-modules';
import { StructureNotificationDetail } from './StructureNotificationDetail';
import { StructurePositionName } from './StructureReferenceName';

export const PositionNotificationContent = ({
  action,
  createdAt,
  fromUser,
  contentTypeId,
}: TNotification) => {
  const { positionDetail, loading, error } = usePositionDetailsById({
    variables: { id: contentTypeId },
  });

  return (
    <StructureNotificationDetail
      action={action}
      error={error}
      loading={loading}
      name={positionDetail?.title}
      contentType="position"
      createdAt={createdAt}
      fromUser={fromUser}
      details={[
        { label: 'Code', value: positionDetail?.code },
        { label: 'Status', value: positionDetail?.status },
        {
          label: 'Parent position',
          value: positionDetail?.parentId ? (
            <StructurePositionName positionId={positionDetail.parentId} />
          ) : undefined,
        },
      ]}
    />
  );
};

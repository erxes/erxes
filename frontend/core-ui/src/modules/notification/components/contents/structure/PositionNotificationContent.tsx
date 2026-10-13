import { usePositionDetailsById } from '@/settings/structure/hooks/usePositionDetailsById';
import { TNotification } from 'ui-modules';
import { StructureNotificationDetail } from './StructureNotificationDetail';
import { StructurePositionName } from './StructureReferenceName';
import { useTranslation } from 'react-i18next';

export const PositionNotificationContent = ({
  action,
  createdAt,
  fromUser,
  contentTypeId,
}: TNotification) => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const { positionDetail, loading, error } = usePositionDetailsById({
    variables: { id: contentTypeId },
  });

  return (
    <StructureNotificationDetail
      action={action}
      error={error}
      loading={loading}
      name={positionDetail?.title}
      contentType={t('position')}
      openLabel={t('open-position')}
      openPath={`/settings/structures/positions?position_id=${contentTypeId}`}
      createdAt={createdAt}
      fromUser={fromUser}
      details={[
        { label: t('code'), value: positionDetail?.code },
        { label: t('status-label'), value: positionDetail?.status },
        {
          label: t('parent-position'),
          value: positionDetail?.parentId ? (
            <StructurePositionName positionId={positionDetail.parentId} />
          ) : undefined,
        },
      ]}
    />
  );
};

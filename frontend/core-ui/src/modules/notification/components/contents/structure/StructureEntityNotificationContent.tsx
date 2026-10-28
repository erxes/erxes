import { useTranslation } from 'react-i18next';
import { TNotification, useStructureEntityById } from 'ui-modules';
import { StructureNotificationDetail } from './StructureNotificationDetail';

const ARCHIVED_STATUS = 'archived';

export const StructureEntityNotificationContent = ({
  action,
  createdAt,
  fromUser,
  contentTypeId,
}: TNotification) => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const { structureEntity, loading, error } =
    useStructureEntityById(contentTypeId);

  return (
    <StructureNotificationDetail
      action={action}
      error={error}
      loading={loading}
      name={structureEntity?.title}
      contentType={t('structure-node')}
      openLabel={t('open-structure-node')}
      openPath={`/settings/structures?entity_id=${contentTypeId ?? ''}`}
      createdAt={createdAt}
      fromUser={fromUser}
      details={[
        { label: t('structure-node-type'), value: structureEntity?.type?.name },
        { label: t('code'), value: structureEntity?.code },
        {
          label: t('status-label'),
          value: structureEntity
            ? t(
                structureEntity.status === ARCHIVED_STATUS
                  ? 'structure-node-archived'
                  : 'structure-node-active',
              )
            : undefined,
        },
      ]}
    />
  );
};

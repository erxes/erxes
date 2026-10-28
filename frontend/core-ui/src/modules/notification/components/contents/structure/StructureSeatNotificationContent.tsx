import { useTranslation } from 'react-i18next';
import { TNotification } from 'ui-modules';
import {
  getStructureSeatCoverageLabel,
  useStructureSeats,
} from '@/structure-access';
import { StructureNotificationDetail } from './StructureNotificationDetail';

export const StructureSeatNotificationContent = ({
  action,
  createdAt,
  fromUser,
  contentTypeId,
}: TNotification) => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const { t: tStructure } = useTranslation('settings', {
    keyPrefix: 'structure',
  });
  const { seats, loading, error } = useStructureSeats({});
  const seat = seats.find(({ _id }) => _id === contentTypeId);

  return (
    <StructureNotificationDetail
      action={action}
      error={error}
      loading={loading}
      name={seat?.position?.name}
      contentType={t('structure-seat')}
      openLabel={t('open-structure-node')}
      openPath={`/settings/structures?entity_id=${seat?.entityId ?? ''}`}
      createdAt={createdAt}
      fromUser={fromUser}
      details={[
        { label: t('structure-node'), value: seat?.entity?.title },
        {
          label: t('structure-seat-coverage'),
          value: seat
            ? getStructureSeatCoverageLabel(seat, tStructure)
            : undefined,
        },
        {
          label: t('structure-seat-holders'),
          value: seat?.holders
            ?.map(
              ({ details, email, _id }) => details?.fullName || email || _id,
            )
            .join(', '),
        },
      ]}
    />
  );
};

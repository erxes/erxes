import { Badge } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IMemberAvailability } from '../types';

export const MemberAvailabilityBadge = ({
  availability,
}: {
  availability?: IMemberAvailability | null;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const status = availability?.status || 'available';
  const label =
    status === 'unavailable'
      ? t('availability-unavailable', 'Unavailable')
      : t('availability-available', 'Available');
  const source =
    availability?.source === 'segment'
      ? t('availability-source-segment', 'Automatic')
      : availability?.source === 'manual'
        ? t('availability-source-manual', 'Set by hand')
        : '';
  const until = availability?.until
    ? new Date(availability.until).toLocaleString()
    : '';
  const title = [source, until && `${t('availability-until', 'Until')} ${until}`, availability?.reason]
    .filter(Boolean)
    .join(' · ');

  return (
    <Badge
      variant={status === 'unavailable' ? 'destructive' : 'success'}
      title={title || undefined}
    >
      {label}
      {availability?.source === 'segment' ? ` · ${source}` : ''}
    </Badge>
  );
};

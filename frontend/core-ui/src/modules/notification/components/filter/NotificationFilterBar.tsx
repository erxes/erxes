import { IconX } from '@tabler/icons-react';
import { Button, parseDateRangeFromString, useMultiQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const NotificationFilterBar = () => {
  const { t, i18n } = useTranslation('common', { keyPrefix: 'notification' });
  const [queries, setQueries] = useMultiQueryState<{
    notificationPriority: string;
    notificationType: string;
    notificationCreatedAt: string;
    notificationFromUserId: string;
    notificationModule: string;
  }>([
    'notificationPriority',
    'notificationType',
    'notificationCreatedAt',
    'notificationFromUserId',
    'notificationModule',
  ]);
  const range = parseDateRangeFromString(queries.notificationCreatedAt);
  const dateLabel = range?.from
    ? [range.from, range.to]
        .filter((date): date is Date => !!date)
        .map((date) => date.toLocaleDateString(i18n.language))
        .join(' – ')
    : queries.notificationCreatedAt;
  const filters = [
    {
      key: 'notificationPriority',
      label: t('priority'),
      value: queries.notificationPriority,
    },
    {
      key: 'notificationType',
      label: t('notification-type'),
      value: queries.notificationType,
    },
    {
      key: 'notificationCreatedAt',
      label: t('created-at'),
      value: dateLabel,
    },
    {
      key: 'notificationFromUserId',
      label: t('filter-by-sender'),
      value: queries.notificationFromUserId
        ? t('members-selected', {
            defaultValue: '{{count}} selected',
            count: queries.notificationFromUserId.split(',').length,
          })
        : null,
    },
    {
      key: 'notificationModule',
      label: t('approval'),
      value: queries.notificationModule,
    },
  ] as const;
  if (!filters.some((filter) => filter.value)) return null;
  return (
    <div
      className="flex flex-wrap gap-1 px-3 pb-2"
      aria-label={t('active-filters', 'Active filters')}
    >
      {filters
        .filter((filter) => filter.value)
        .map(({ key, label, value }) => (
          <Button
            key={key}
            variant="secondary"
            size="sm"
            className="max-w-full h-6 text-xs"
            aria-label={`${t('remove-filter', 'Remove filter')}: ${label}`}
            title={`${label}: ${value}`}
            onClick={() => setQueries({ [key]: null })}
          >
            <span className="truncate">
              {label}: {value}
            </span>
            <IconX className="size-3" />
          </Button>
        ))}
    </div>
  );
};

import { IconRadar } from '@tabler/icons-react';
import {
  Badge,
  RelativeDateDisplay,
  ScrollArea,
  SideMenu,
  Spinner,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  ITrackedDataItem,
  IRelationWidgetProps,
  useCustomerDetail,
} from 'ui-modules';

const TrackedDataRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <li className="flex justify-between items-center gap-4 px-3 py-2 text-sm border-b last:border-b-0">
    <span className="text-accent-foreground truncate">{label}</span>
    <span className="font-medium text-foreground text-right truncate">
      {children}
    </span>
  </li>
);

const renderTrackedValue = (item: ITrackedDataItem) => {
  if (item.dateValue) {
    return <RelativeDateDisplay.Value value={item.dateValue} />;
  }

  if (item.stringValue) {
    return item.stringValue;
  }

  if (item.value === null || item.value === undefined) {
    return '-';
  }

  return String(item.value);
};

export const TrackedDataWidgets = ({
  contentId,
  customerId,
}: IRelationWidgetProps) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer.detail' });
  const _id = customerId || contentId;

  const { customerDetail, loading } = useCustomerDetail({
    variables: { _id },
    skip: !_id,
  });

  const { isOnline, lastSeenAt, sessionCount, trackedData } =
    customerDetail || {};
  const items = trackedData ?? [];

  return (
    <SideMenu.Content value="trackedData" className="bg-sidebar">
      <SideMenu.Header
        label={t('tracked-data', 'Tracked data')}
        Icon={IconRadar}
      />
      {loading ? (
        <Spinner containerClassName="py-6" />
      ) : (
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-3">
            <ul className="bg-background rounded-lg shadow-xs">
              <TrackedDataRow label={t('status', 'Status')}>
                <Badge variant={isOnline ? 'success' : 'secondary'}>
                  {isOnline ? t('online', 'Online') : t('offline', 'Offline')}
                </Badge>
              </TrackedDataRow>
              <TrackedDataRow label={t('last-online', 'Last online')}>
                {lastSeenAt ? (
                  <RelativeDateDisplay.Value value={lastSeenAt} />
                ) : (
                  '-'
                )}
              </TrackedDataRow>
              <TrackedDataRow label={t('session-count', 'Session count')}>
                {sessionCount ?? 0}
              </TrackedDataRow>
              {items.map((item) => (
                <TrackedDataRow key={item.field} label={item.field}>
                  {renderTrackedValue(item)}
                </TrackedDataRow>
              ))}
            </ul>
            {items.length === 0 && (
              <p className="px-3 pt-3 text-xs text-accent-foreground">
                {t(
                  'no-tracked-data',
                  'No tracked data has been collected yet.',
                )}
              </p>
            )}
          </div>
        </ScrollArea>
      )}
    </SideMenu.Content>
  );
};

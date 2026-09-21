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
  useCompanyDetail,
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
  const raw = item.value ?? item.stringValue;

  if (raw === null || raw === undefined || raw === '') {
    return '-';
  }

  const asString = String(raw);

  if (item.dateValue && Number.isNaN(Number(asString))) {
    return <RelativeDateDisplay.Value value={item.dateValue} />;
  }

  return asString;
};

export const TrackedDataWidgets = ({
  contentId,
  contentType,
  customerId,
  companyId,
}: IRelationWidgetProps) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer.detail' });

  const isCompany = contentType === 'core:company';

  const resolvedCompanyId = isCompany ? companyId || contentId : undefined;
  const resolvedCustomerId = isCompany
    ? undefined
    : customerId || (contentType === 'core:customer' ? contentId : undefined);

  const { customerDetail, loading: customerLoading } = useCustomerDetail({
    variables: { _id: resolvedCustomerId },
    skip: !resolvedCustomerId,
  });

  const { companyDetail, loading: companyLoading } = useCompanyDetail({
    variables: { _id: resolvedCompanyId },
    skip: !resolvedCompanyId,
  });

  const { isOnline, lastSeenAt, sessionCount } = customerDetail || {};
  const items =
    (isCompany ? companyDetail?.trackedData : customerDetail?.trackedData) ??
    [];
  const loading = isCompany ? companyLoading : customerLoading;

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
              {!isCompany && (
                <>
                  <TrackedDataRow label={t('status', 'Status')}>
                    <Badge variant={isOnline ? 'success' : 'secondary'}>
                      {isOnline
                        ? t('online', 'Online')
                        : t('offline', 'Offline')}
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
                </>
              )}
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

import { useTranslation } from 'react-i18next';
import { useEmailDeliveryDetail } from '@/settings/email-deliveries/hooks/useEmailDeliveries';
import { Sheet, Skeleton, useQueryState } from 'erxes-ui';
import dayjs from 'dayjs';

const Row = ({ label, value }: { label: string; value?: string }) =>
  value ? (
    <div className="grid grid-cols-3 gap-3 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="col-span-2 break-words">{value}</span>
    </div>
  ) : null;

const EmailDeliveryDetail = ({ id }: { id: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'email-deliveries' });
  const { detail, loading } = useEmailDeliveryDetail(id);

  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-1/2" />
      </div>
    );
  }

  if (!detail) {
    return <p className="p-4 text-muted-foreground">{t('not-found')}</p>;
  }

  const date = (value?: string) =>
    value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : undefined;

  const list = (values?: string[]) =>
    values?.length ? values.join(', ') : undefined;

  return (
    <div className="divide-y p-4">
      <div>
        <Row label={t('subject')} value={detail.subject} />
        <Row label={t('from')} value={detail.from} />
        <Row label={t('to')} value={list(detail.toEmails)} />
        <Row label={t('cc')} value={list(detail.ccEmails)} />
      </div>

      <div>
        <Row label={t('status')} value={detail.status} />
        <Row label={t('sent-at')} value={date(detail.sentAt)} />
        <Row label={t('provider')} value={detail.provider} />
        <Row label={t('message-id')} value={detail.messageId} />
        <Row label={t('rejected')} value={list(detail.rejected)} />
        <Row label={t('error')} value={detail.error} />
      </div>

      <div>
        <Row label={t('delivery')} value={detail.deliveryStatus} />
        <Row label={t('delivery-at')} value={date(detail.deliveryStatusAt)} />
        <Row label={t('bounced')} value={list(detail.bounced)} />
        <Row label={t('complained')} value={list(detail.complained)} />
        <Row label={t('opened')} value={list(detail.opened)} />
        <Row label={t('clicked')} value={list(detail.clicked)} />
      </div>

      <div>
        <Row label={t('source')} value={detail.source} />
        <Row label={t('source-id')} value={detail.sourceId} />
        <Row label={t('user-id')} value={detail.userId} />
        <Row label={t('created-at')} value={date(detail.createdAt)} />
      </div>

      {detail.providerResponse && (
        <div className="pt-3">
          <p className="mb-1 text-sm text-muted-foreground">
            {t('provider-response')}
          </p>
          <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
            {detail.providerResponse}
          </pre>
        </div>
      )}
    </div>
  );
};

export const EmailDeliveryDetailSheet = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'email-deliveries' });
  const [deliveryId, setDeliveryId] = useQueryState<string>('deliveryId');

  return (
    <Sheet
      open={!!deliveryId}
      onOpenChange={() => deliveryId && setDeliveryId(null)}
    >
      <Sheet.View className="sm:max-w-2xl flex flex-col gap-0">
        <Sheet.Header>
          <Sheet.Title>{t('email-delivery')}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="flex-1 min-h-0 overflow-auto">
          {deliveryId && <EmailDeliveryDetail id={deliveryId} />}
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};

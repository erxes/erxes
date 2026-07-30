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
    return <p className="p-4 text-muted-foreground">Not found.</p>;
  }

  const date = (value?: string) =>
    value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : undefined;

  const list = (values?: string[]) =>
    values?.length ? values.join(', ') : undefined;

  return (
    <div className="divide-y p-4">
      <div>
        <Row label="Subject" value={detail.subject} />
        <Row label="From" value={detail.from} />
        <Row label="To" value={list(detail.toEmails)} />
        <Row label="CC" value={list(detail.ccEmails)} />
      </div>

      <div>
        <Row label="Status" value={detail.status} />
        <Row label="Sent at" value={date(detail.sentAt)} />
        <Row label="Provider" value={detail.provider} />
        <Row label="Message id" value={detail.messageId} />
        <Row label="Rejected" value={list(detail.rejected)} />
        <Row label="Error" value={detail.error} />
      </div>

      <div>
        <Row label="Delivery" value={detail.deliveryStatus} />
        <Row label="Delivery at" value={date(detail.deliveryStatusAt)} />
        <Row label="Bounced" value={list(detail.bounced)} />
        <Row label="Complained" value={list(detail.complained)} />
        <Row label="Opened" value={list(detail.opened)} />
        <Row label="Clicked" value={list(detail.clicked)} />
      </div>

      <div>
        <Row label="Source" value={detail.source} />
        <Row label="Source id" value={detail.sourceId} />
        <Row label="User id" value={detail.userId} />
        <Row label="Created at" value={date(detail.createdAt)} />
      </div>

      {detail.providerResponse && (
        <div className="pt-3">
          <p className="mb-1 text-sm text-muted-foreground">
            Provider response
          </p>
          {/* Stored verbatim and never parsed, so it is shown as-is. */}
          <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
            {detail.providerResponse}
          </pre>
        </div>
      )}
    </div>
  );
};

export const EmailDeliveryDetailSheet = () => {
  const [deliveryId, setDeliveryId] = useQueryState<string>('deliveryId');

  return (
    <Sheet
      open={!!deliveryId}
      onOpenChange={() => deliveryId && setDeliveryId(null)}
    >
      <Sheet.View className="sm:max-w-2xl flex flex-col gap-0">
        <Sheet.Header>
          <Sheet.Title>Email delivery</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="flex-1 min-h-0 overflow-auto">
          {deliveryId && <EmailDeliveryDetail id={deliveryId} />}
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};

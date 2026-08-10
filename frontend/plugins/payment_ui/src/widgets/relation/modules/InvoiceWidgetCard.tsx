import { Badge, Card, RelativeDateDisplay, Separator } from 'erxes-ui';

import { IInvoice } from '~/modules/payment/types/Payment';

export const InvoiceWidgetCard = ({ invoice }: { invoice: IInvoice }) => {
  const {
    invoiceNumber,
    description,
    amount,
    currency,
    status,
    createdAt,
  } = invoice || {};

  return (
    <Card className="bg-background">
      <div className="px-3 h-9 flex flex-row items-center justify-between space-y-0">
        <Badge>{invoiceNumber}</Badge>
        <Badge variant={status === 'paid' ? 'success' : 'destructive'}>
          {status}
        </Badge>
      </div>
      <Separator />
      <div className="p-3 flex flex-col gap-1">
        {description && (
          <span className="text-sm text-muted-foreground">{description}</span>
        )}
        <h5 className="font-semibold">
          {amount?.toLocaleString()} {currency}
        </h5>
      </div>
      <Separator />
      <div className="px-3 h-9 flex items-center text-xs text-muted-foreground">
        {createdAt && (
          <RelativeDateDisplay value={createdAt as unknown as string} asChild>
            <RelativeDateDisplay.Value
              value={createdAt as unknown as string}
            />
          </RelativeDateDisplay>
        )}
      </div>
    </Card>
  );
};

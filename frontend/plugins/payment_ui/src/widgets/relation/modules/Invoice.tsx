import { IconInvoice } from '@tabler/icons-react';
import { ScrollArea, Separator, Spinner } from 'erxes-ui';

import { IInvoice } from '~/modules/payment/types/Payment';
import { InvoiceWidgetCard } from './InvoiceWidgetCard';
import { useInvoices } from '~/modules/payment/hooks/use-invoices';

export const Invoice = ({
  contentId,
  contentType,
}: {
  contentId: string;
  contentType: string;
}) => {
  const { invoices, loading } = useInvoices({
    variables: {
      contentType,
      contentTypeId: contentId,
    },
  });

  if (loading) {
    return <Spinner containerClassName="py-20" />;
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="flex flex-auto flex-col gap-4 justify-center items-center text-muted-foreground">
        <div className="border border-dashed p-6 bg-background rounded-xl">
          <IconInvoice />
        </div>
        <span className="text-sm">No invoices to display at the moment.</span>
      </div>
    );
  }

  return (
    <>
      <div className="h-11 px-4 flex items-center gap-2 flex-none bg-background justify-between">
        <span className="font-medium text-primary">Invoices</span>
      </div>
      <Separator />
      <ScrollArea className="flex-auto">
        <div className="flex flex-col gap-4 p-4">
          {invoices.map((invoice: IInvoice) => (
            <InvoiceWidgetCard key={invoice._id} invoice={invoice} />
          ))}
        </div>
      </ScrollArea>
    </>
  );
};

import {
  Badge,
  Input,
  Popover,
  RecordTableInlineCell,
  Spinner,
  Textarea,
  TextOverflowTooltip,
} from 'erxes-ui';
import { useState } from 'react';
import { usePermissionCheck } from 'ui-modules';
import { SelectInvoiceStatus } from '~/modules/payment/components/InvoiceStatusFilter';
import { useInvoiceEdit } from '~/modules/payment/hooks/useInvoiceEdit';
import { IInvoice } from '~/modules/payment/types/Payment';

export const INVOICE_EDIT_ACTION = 'paymentInvoiceEdit';

export const useCanEditInvoice = (): boolean => {
  const { isLoaded, hasActionPermission } = usePermissionCheck();

  return isLoaded && hasActionPermission(INVOICE_EDIT_ACTION);
};

export const InvoiceDescriptionCell = ({ invoice }: { invoice: IInvoice }) => {
  const canEdit = useCanEditInvoice();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState(invoice.description ?? '');
  const { editInvoice, loading } = useInvoiceEdit();

  if (!canEdit) {
    return (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={invoice.description} />
      </RecordTableInlineCell>
    );
  }

  const onSave = () => {
    if (description === (invoice.description ?? '')) return;

    editInvoice(invoice._id, { description });
  };

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (nextOpen) {
          setDescription(invoice.description ?? '');
          return;
        }

        onSave();
      }}
    >
      <RecordTableInlineCell.Trigger>
        <TextOverflowTooltip value={invoice.description} />
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.currentTarget.value)}
          disabled={loading}
        />
      </RecordTableInlineCell.Content>
    </Popover>
  );
};

export const InvoiceAmountCell = ({ invoice }: { invoice: IInvoice }) => {
  const canEdit = useCanEditInvoice();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(invoice.amount ?? ''));
  const { editInvoice, loading } = useInvoiceEdit();

  if (!canEdit) {
    return <RecordTableInlineCell>{invoice.amount}</RecordTableInlineCell>;
  }

  const onSave = () => {
    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setAmount(String(invoice.amount ?? ''));
      return;
    }

    if (parsedAmount === invoice.amount) return;

    editInvoice(invoice._id, { amount: parsedAmount });
  };

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (nextOpen) {
          setAmount(String(invoice.amount ?? ''));
          return;
        }

        onSave();
      }}
    >
      <RecordTableInlineCell.Trigger>
        {invoice.amount}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <Input
          type="number"
          min={0}
          step="any"
          value={amount}
          onChange={(event) => setAmount(event.currentTarget.value)}
          disabled={loading}
        />
      </RecordTableInlineCell.Content>
    </Popover>
  );
};

const InvoiceStatusBadge = ({ status }: { status: string }) => (
  <Badge variant={status === 'paid' ? 'success' : 'destructive'}>
    {status}
  </Badge>
);

export const InvoiceStatusCell = ({ invoice }: { invoice: IInvoice }) => {
  const canEdit = useCanEditInvoice();
  const [open, setOpen] = useState(false);
  const { editInvoice, loading } = useInvoiceEdit();

  if (!canEdit) {
    return (
      <RecordTableInlineCell>
        <InvoiceStatusBadge status={invoice.status} />
      </RecordTableInlineCell>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <RecordTableInlineCell.Trigger>
        <InvoiceStatusBadge status={invoice.status} />
        {loading && <Spinner />}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <SelectInvoiceStatus.Content
          value={invoice.status}
          onValueChange={(status) => {
            setOpen(false);

            if (status === invoice.status) return;

            editInvoice(invoice._id, { status });
          }}
        />
      </RecordTableInlineCell.Content>
    </Popover>
  );
};

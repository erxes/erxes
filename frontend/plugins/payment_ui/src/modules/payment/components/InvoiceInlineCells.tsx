import {
  Badge,
  Input,
  Popover,
  REACT_APP_API_URL,
  RecordTableInlineCell,
  Spinner,
  Textarea,
  TextOverflowTooltip,
  Tooltip,
} from 'erxes-ui';
import { IconCheck } from '@tabler/icons-react';
import { useState } from 'react';
import { usePermissionCheck } from 'ui-modules';
import { SelectInvoiceStatus } from '~/modules/payment/components/InvoiceStatusFilter';
import { PAYMENT_KINDS } from '~/modules/payment/constants';
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

const getPaymentKindName = (kind: string): string =>
  Object.entries(PAYMENT_KINDS).find(([key]) => key === kind)?.[1].name || kind;

/**
 * Every payment method attempted on an invoice, newest first, flagged `paid`
 * when a paid transaction used it. Matches the backend kind filter, which
 * matches invoices by any transaction of that kind.
 */
export const getInvoicePaymentMethods = (
  invoice: IInvoice,
): { kind: string; paid: boolean }[] => {
  const transactions = [...(invoice?.transactions || [])]
    .filter((tr) => tr?.paymentKind)
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const methods = new Map<string, boolean>();

  for (const tr of transactions) {
    methods.set(
      tr.paymentKind,
      methods.get(tr.paymentKind) === true || tr.status === 'paid',
    );
  }

  return Array.from(methods, ([kind, paid]) => ({ kind, paid })).sort(
    (a, b) => Number(b.paid) - Number(a.paid),
  );
};

const PaymentMethodLogo = ({ kind }: { kind: string }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return null;
  }

  return (
    <img
      className="size-4 flex-none rounded-sm object-contain"
      src={`${REACT_APP_API_URL}/pl:payment/static/images/payments/${kind}.png`}
      alt=""
      onError={() => setFailed(true)}
    />
  );
};

const PaymentMethodBadge = ({ kind, paid }: { kind: string; paid: boolean }) => (
  <Badge variant={paid ? 'success' : 'secondary'} className="min-w-0 pl-1">
    <PaymentMethodLogo kind={kind} />
    <span className="truncate">{getPaymentKindName(kind)}</span>
    {paid && <IconCheck className="size-3 flex-none" />}
  </Badge>
);

/**
 * One chip for the main method (paid first, else the latest attempt) and a
 * `+N` chip whose tooltip lists the other attempted methods.
 */
export const InvoicePaymentMethodBadges = ({
  invoice,
}: {
  invoice: IInvoice;
}) => {
  const [main, ...rest] = getInvoicePaymentMethods(invoice);

  if (!main) {
    return <span className="text-muted-foreground">-</span>;
  }

  return (
    <div className="flex min-w-0 items-center gap-1 overflow-hidden">
      <PaymentMethodBadge kind={main.kind} paid={main.paid} />
      {rest.length > 0 && (
        <Tooltip>
          <Tooltip.Trigger asChild>
            <Badge variant="secondary" className="flex-none">
              +{rest.length}
            </Badge>
          </Tooltip.Trigger>
          <Tooltip.Content className="flex flex-col gap-1">
            {rest.map(({ kind, paid }) => (
              <span key={kind} className="flex items-center gap-1.5">
                <PaymentMethodLogo kind={kind} />
                {getPaymentKindName(kind)}
                {paid && <IconCheck className="size-3" />}
              </span>
            ))}
          </Tooltip.Content>
        </Tooltip>
      )}
    </div>
  );
};

export const InvoicePaymentMethodCell = ({
  invoice,
}: {
  invoice: IInvoice;
}) => (
  <RecordTableInlineCell>
    <InvoicePaymentMethodBadges invoice={invoice} />
  </RecordTableInlineCell>
);

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

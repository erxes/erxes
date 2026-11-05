import { FormEvent, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ScrollArea,
  Select,
  Spinner,
  Textarea,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { IconPencil } from '@tabler/icons-react';
import {
  CustomersInline,
  PANEL_INPUT_CLASS_NAME,
  PanelField,
  PanelFormLayout,
  PanelFormRow,
} from 'ui-modules';
import { TourismPanelFormBlock } from '@/tms/side-panel/TourismPanelForm';
import {
  ITourismPanelViewProps,
  ITourismPanelViews,
} from '@/tms/side-panel/tourismPanelTypes';
import {
  ITourOrder,
  useEditTourOrder,
  useTourOrderDetail,
} from '../hooks/useTourOrders';

const ORDER_STATUS_OPTIONS = [
  { value: 'refunded', label: 'Refunded' },
  { value: 'cancelled', label: 'Cancelled' },
];

const TERMINAL_ORDER_STATUSES = new Set(['refunded', 'cancelled']);

const STATUS_TONES: Record<string, string> = {
  paid: 'border-emerald-500/15 bg-emerald-500/6 text-emerald-200',
  pending: 'border-amber-500/15 bg-amber-500/6 text-amber-200',
  prepaid: 'border-sky-500/15 bg-sky-500/6 text-sky-200',
  refunded: 'border-violet-500/15 bg-violet-500/6 text-violet-200',
  cancelled: 'border-rose-500/15 bg-rose-500/6 text-rose-200',
};

const STATUS_LABELS: Record<string, string> = {
  paid: 'Paid',
  pending: 'Pending',
  prepaid: 'Prepaid',
  refunded: 'Refunded',
  cancelled: 'Cancelled',
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';

  return new Date(dateStr).toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatAmount = (amount?: number) =>
  amount == null ? '' : `${amount.toLocaleString()} USD`;

const getInitialStatus = (order: ITourOrder) =>
  TERMINAL_ORDER_STATUSES.has(order.status || '') ? order.status ?? '' : '';

const getAdditionalCustomers = (order: ITourOrder) =>
  Array.isArray(order.additionalCustomers)
    ? order.additionalCustomers.filter(
        (customerId): customerId is string =>
          typeof customerId === 'string' && !!customerId,
      )
    : [];

const OrderStatusBadge = ({ status }: { status?: string }) => {
  const safeStatus = status ?? 'pending';
  const tone =
    STATUS_TONES[safeStatus] ??
    'border-border/60 bg-muted/60 text-muted-foreground';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${tone}`}
    >
      <span className="size-1.5 rounded-full bg-current opacity-75" />
      {STATUS_LABELS[safeStatus] ?? 'Pending'}
    </span>
  );
};

const OrderValueRow = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <PanelField label={label} cell={false}>
    <div className="flex min-h-7 flex-wrap items-center gap-1 px-2 text-xs">
      {children || <span className="text-muted-foreground">-</span>}
    </div>
  </PanelField>
);

const OrderCustomer = ({ customerId }: { customerId: string }) => {
  const { t } = useTranslation('tourism');

  return (
    <CustomersInline.Provider
      customerIds={[customerId]}
      placeholder={t('unnamed-customer')}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <CustomersInline.Avatar />
        <span className="truncate">
          <CustomersInline.Title />
        </span>
      </span>
    </CustomersInline.Provider>
  );
};

const OrderNote = ({ label, note }: { label: string; note: string }) => (
  <TourismPanelFormBlock label={label}>
    <p className="whitespace-pre-wrap rounded-sm bg-muted/40 px-2 py-1.5 text-xs leading-relaxed">
      {note}
    </p>
  </TourismPanelFormBlock>
);

const OrderSummary = ({ order }: { order: ITourOrder }) => {
  const { t } = useTranslation('tourism');
  const additionalCustomers = getAdditionalCustomers(order);

  return (
    <div className="flex flex-col gap-1">
      <OrderValueRow label={t('booking-summary')}>
        <span className="font-mono break-all">{order._id}</span>
      </OrderValueRow>
      <OrderValueRow label={t('status')}>
        <OrderStatusBadge status={order.status} />
      </OrderValueRow>
      <OrderValueRow label={t('amount')}>
        {formatAmount(order.amount)}
      </OrderValueRow>
      <OrderValueRow label={t('people')}>
        {order.numberOfPeople != null ? String(order.numberOfPeople) : ''}
      </OrderValueRow>
      <OrderValueRow label={t('detail-row-type')}>{order.type}</OrderValueRow>
      <OrderValueRow label={t('detail-row-created-at')}>
        {formatDate(order.createdAt)}
      </OrderValueRow>
      <OrderValueRow label={t('main-customer')}>
        {order.customerId && <OrderCustomer customerId={order.customerId} />}
      </OrderValueRow>
      {additionalCustomers.map((customerId, index) => (
        <OrderValueRow
          key={customerId}
          label={t('additional-customer', { index: index + 1 })}
        >
          <OrderCustomer customerId={customerId} />
        </OrderValueRow>
      ))}
      {order.note && <OrderNote label={t('booking-note')} note={order.note} />}
      {order.internalNote && (
        <OrderNote label={t('internal-note')} note={order.internalNote} />
      )}
    </div>
  );
};

const OrderEditForm = ({
  order,
  onDone,
}: {
  order: ITourOrder;
  onDone: () => void;
}) => {
  const { t } = useTranslation('tourism');
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { editOrder, loading } = useEditTourOrder({
    refetchQueries: ['BmsOrders', 'BmsOrderDetail'],
    awaitRefetchQueries: true,
  });
  const initialStatus = getInitialStatus(order);
  const initialInternalNote = order.internalNote || '';
  const [statusValue, setStatusValue] = useState(initialStatus);
  const [internalNoteValue, setInternalNoteValue] =
    useState(initialInternalNote);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isBusy = loading || saving;
  const isDirty =
    statusValue !== initialStatus || internalNoteValue !== initialInternalNote;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isDirty) return;

    const trimmedInternalNote = internalNoteValue.trim();

    if (!statusValue) {
      setValidationError(t('please-select-terminal-status'));
      return;
    }

    if (TERMINAL_ORDER_STATUSES.has(statusValue) && !trimmedInternalNote) {
      setValidationError(t('please-add-explanation'));
      return;
    }

    try {
      await confirm({
        message: t('confirm-update-booking', { status: statusValue }),
        options: { confirmationValue: statusValue },
      });

      setValidationError(null);
      setSaving(true);

      await editOrder({
        variables: {
          id: order._id,
          order: {
            branchId: order.branchId,
            customerId: order.customerId,
            tourId: order.tourId,
            amount: order.amount,
            status: statusValue,
            internalNote: trimmedInternalNote,
            numberOfPeople: order.numberOfPeople,
            type: order.type,
            additionalCustomers: order.additionalCustomers,
            isChild: order.isChild,
            parent: order.parent,
          },
        },
      });

      toast({
        title: t('success'),
        description: t('booking-updated-successfully'),
      });

      onDone();
    } catch (error) {
      if (error instanceof Error && error.message === 'Dialog closed') {
        return;
      }

      toast({
        title: t('error'),
        description:
          error instanceof Error
            ? error.message
            : t('failed-to-update-booking'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 min-h-0 flex-col">
      <PanelFormLayout
        onCancel={onDone}
        saving={isBusy}
        saveLabel={isBusy ? t('saving') : t('save-changes')}
      >
        <OrderSummary order={order} />
        <div className="flex flex-col gap-0.5 pt-3">
          <span className="text-xs font-semibold">
            {t('edit-booking-title')}
          </span>
          <span className="text-xs text-muted-foreground">
            {t('edit-booking-desc')}
          </span>
        </div>
        <PanelFormRow label={t('status')} required>
          <Select
            value={statusValue || undefined}
            onValueChange={(value) => {
              setStatusValue(value);
              setValidationError(null);
            }}
          >
            <Select.Trigger className={PANEL_INPUT_CLASS_NAME}>
              <Select.Value placeholder={t('select-booking-status')} />
            </Select.Trigger>
            <Select.Content align="start">
              {ORDER_STATUS_OPTIONS.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className="h-7 text-xs"
                >
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </PanelFormRow>
        <TourismPanelFormBlock
          label={t('internal-note')}
          error={validationError ?? undefined}
        >
          <Textarea
            value={internalNoteValue}
            onChange={(event) => {
              setInternalNoteValue(event.target.value);
              setValidationError(null);
            }}
            placeholder={t('add-internal-note')}
            className="min-h-20 text-xs"
          />
          <span className="text-xs text-muted-foreground">
            {t('explanation-required-for-cancel')}
          </span>
        </TourismPanelFormBlock>
      </PanelFormLayout>
    </form>
  );
};

const OrderPanelDetail = ({ contentId }: ITourismPanelViewProps) => {
  const { t } = useTranslation('tourism');
  const [editing, setEditing] = useState(false);
  const { order, loading, error } = useTourOrderDetail(contentId, true);

  if (loading && !order) {
    return <Spinner containerClassName="py-12" />;
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          {error ? error.message : t('booking-not-loaded')}
        </p>
        <p className="text-xs text-muted-foreground">
          {t('reload-booking-list')}
        </p>
      </div>
    );
  }

  if (editing) {
    return (
      <OrderEditForm
        key={order._id}
        order={order}
        onDone={() => setEditing(false)}
      />
    );
  }

  return (
    <>
      <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
        <div className="p-3">
          <OrderSummary order={order} />
        </div>
      </ScrollArea>
      <div className="flex shrink-0 justify-end gap-1 border-t bg-background p-2">
        <Button type="button" size="sm" onClick={() => setEditing(true)}>
          <IconPencil />
          {t('edit-booking')}
        </Button>
      </div>
    </>
  );
};

export const ORDER_PANEL: ITourismPanelViews = {
  addLabel: 'order-details',
  editLabel: 'order-details',
  Detail: OrderPanelDetail,
};

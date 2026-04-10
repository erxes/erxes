'use client';

import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Dialog,
  Select,
  Separator,
  Sheet,
  Spinner,
  Textarea,
  Tooltip,
  useConfirm,
  useToast,
} from 'erxes-ui';
import {
  IconCalendarEventFilled,
  IconCoin,
  IconFileDescription,
  IconInfoCircle,
  IconTag,
  IconUsers,
} from '@tabler/icons-react';
import { CustomersInline } from 'ui-modules';

import { useEditTourOrder, useTourOrderDetail } from '../hooks/useTourOrders';

interface Props {
  orderId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => Promise<any> | void;
}

const ORDER_STATUS_OPTIONS = [
  { value: 'refunded', label: 'Refunded' },
  { value: 'cancelled', label: 'Cancelled' },
];

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';

  return new Date(dateStr).toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatAmount(amount?: number): string {
  if (amount == null) return '—';
  return `${amount.toLocaleString()} USD`;
}

function StatusBadge({ status }: Readonly<{ status?: string }>) {
  const toneMap: Record<string, string> = {
    paid: 'border-emerald-500/15 bg-emerald-500/6 text-emerald-200',
    pending: 'border-amber-500/15 bg-amber-500/6 text-amber-200',
    prepaid: 'border-sky-500/15 bg-sky-500/6 text-sky-200',
    refunded: 'border-violet-500/15 bg-violet-500/6 text-violet-200',
    cancelled: 'border-rose-500/15 bg-rose-500/6 text-rose-200',
  };

  const labelMap: Record<string, string> = {
    paid: 'Paid',
    pending: 'Pending',
    prepaid: 'Prepaid',
    refunded: 'Refunded',
    cancelled: 'Cancelled',
  };

  const safeStatus = status ?? 'pending';
  const cls =
    toneMap[safeStatus] ?? 'border-border/60 bg-muted/60 text-muted-foreground';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${cls}`}
    >
      <span className="size-1.5 rounded-full bg-current opacity-75" />
      {labelMap[safeStatus] ?? 'Pending'}
    </span>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof IconInfoCircle;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <div className="inline-flex items-center gap-2 text-muted-foreground">
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </div>
      <span className="max-w-[220px] text-right text-foreground wrap-break-word">
        {value}
      </span>
    </div>
  );
}

function CustomerInlineCard({
  customerId,
  label,
}: {
  customerId: string;
  label: string;
}) {
  return (
    <CustomersInline.Provider
      customerIds={[customerId]}
      placeholder="Unnamed customer"
    >
      <Card className="bg-background border-border/60">
        <div className="flex items-center gap-3 p-3">
          <CustomersInline.Avatar size="xl" />
          <div className="min-w-0 space-y-1">
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </div>
            <div className="text-sm font-medium truncate text-foreground">
              <CustomersInline.Title />
            </div>
          </div>
        </div>
      </Card>
    </CustomersInline.Provider>
  );
}

export const OrderDetailSheet = ({
  orderId,
  open,
  onOpenChange,
  onUpdated,
}: Props) => {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { order, loading, refetch } = useTourOrderDetail(
    orderId ?? undefined,
    open,
  );
  const { editOrder, loading: updating } = useEditTourOrder();

  const additionalCustomers = Array.isArray(order?.additionalCustomers)
    ? order.additionalCustomers.filter(
        (customerId): customerId is string => !!customerId,
      )
    : [];

  const [statusValue, setStatusValue] = useState('pending');
  const [noteValue, setNoteValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    setStatusValue(order?.status || 'pending');
    setNoteValue(order?.note || '');
    setValidationError(null);
  }, [order?._id, order?.status, order?.note, open]);

  const isDirty =
    statusValue !== (order?.status || 'pending') ||
    noteValue !== (order?.note || '');

  const handleEditOpenChange = (open: boolean) => {
    setEditOpen(open);

    if (open) {
      setStatusValue(
        order?.status === 'refunded' || order?.status === 'cancelled'
          ? order.status
          : 'cancelled',
      );
      setNoteValue(order?.note || '');
    }

    setValidationError(null);
  };

  const handleSave = async () => {
    if (!orderId || !isDirty) return;

    const trimmedNote = noteValue.trim();
    const requiresExplanation =
      statusValue === 'cancelled' || statusValue === 'refunded';

    if (requiresExplanation && !trimmedNote) {
      setValidationError(
        'Please add an explanation for cancelled or refunded bookings',
      );
      return;
    }

    try {
      if (statusValue === 'cancelled' || statusValue === 'refunded') {
        await confirm({
          message: `Are you sure you want to mark this booking as ${statusValue}?`,
          options: { confirmationValue: statusValue },
        });
      }

      setValidationError(null);

      await editOrder({
        variables: {
          id: orderId,
          order: {
            status: statusValue,
            note: trimmedNote,
          },
        },
      });

      await refetch?.();

      toast({
        title: 'Success',
        description: 'Booking details updated successfully',
      });

      await onUpdated?.();
      setEditOpen(false);
    } catch (error) {
      if (error instanceof Error && error.message === 'Dialog closed') {
        return;
      }

      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to update booking',
        variant: 'destructive',
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.View className="w-[560px] sm:max-w-[560px] p-0">
        {loading ? (
          <div className="flex items-center justify-center h-full min-h-[300px]">
            <Spinner />
          </div>
        ) : (
          <>
            <Sheet.Header>
              <Sheet.Title>Order Details</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>

            <Sheet.Content className="flex-1 px-6 py-4 overflow-y-auto">
              <div className="space-y-4">
                <Card className="overflow-hidden border-border/60 bg-background">
                  <div className="p-4 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 space-y-1">
                        <div className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
                          Booking Summary
                        </div>
                        <div className="font-mono text-sm break-all text-foreground">
                          {order?._id ?? '—'}
                        </div>
                      </div>

                      <StatusBadge status={order?.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 border rounded-xl bg-muted/40 border-border/60">
                        <div className="inline-flex items-center gap-2 text-xs tracking-wide uppercase text-muted-foreground">
                          <IconCoin className="w-4 h-4" />
                          Amount
                        </div>
                        <div className="mt-2 text-lg font-semibold text-foreground">
                          {formatAmount(order?.amount)}
                        </div>
                      </div>

                      <div className="p-3 border rounded-xl bg-muted/40 border-border/60">
                        <div className="inline-flex items-center gap-2 text-xs tracking-wide uppercase text-muted-foreground">
                          <IconUsers className="w-4 h-4" />
                          People
                        </div>
                        <div className="mt-2 text-lg font-semibold text-foreground">
                          {order?.numberOfPeople ?? '—'}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <DetailRow
                        icon={IconTag}
                        label="Type"
                        value={order?.type || '—'}
                      />
                      <DetailRow
                        icon={IconCalendarEventFilled}
                        label="Created At"
                        value={formatDate(order?.createdAt)}
                      />
                    </div>
                  </div>
                </Card>

                {order?.customerId && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
                      Main Customer
                    </div>
                    <CustomerInlineCard
                      customerId={order.customerId}
                      label="Primary"
                    />
                  </div>
                )}

                {additionalCustomers.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
                        Additional Customers
                      </div>
                      <Tooltip.Provider>
                        <Tooltip>
                          <Tooltip.Trigger asChild>
                            <span className="px-2 py-1 text-[11px] font-medium rounded-full bg-primary/10 text-primary">
                              {additionalCustomers.length} linked
                            </span>
                          </Tooltip.Trigger>
                          <Tooltip.Content>
                            Customers linked to this booking
                          </Tooltip.Content>
                        </Tooltip>
                      </Tooltip.Provider>
                    </div>

                    <div className="space-y-2">
                      {additionalCustomers.map((customerId, index) => (
                        <CustomerInlineCard
                          key={customerId}
                          customerId={customerId}
                          label={`Additional ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {order?.note && (
                  <Card className="overflow-hidden border-border/60 bg-background">
                    <div className="p-4 space-y-2">
                      <div className="inline-flex items-center gap-2 text-xs font-medium tracking-wide uppercase text-muted-foreground">
                        <IconFileDescription className="w-4 h-4" />
                         Note
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                        {order.note}
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </Sheet.Content>

            <Sheet.Footer className="bg-background">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleEditOpenChange(true)}
                disabled={updating}
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updating}
              >
                Close
              </Button>
            </Sheet.Footer>
          </>
        )}
      </Sheet.View>

      <Dialog open={editOpen} onOpenChange={handleEditOpenChange}>
        <Dialog.Content className="sm:max-w-[520px]">
          <Dialog.Header>
            <Dialog.Title>Edit Booking</Dialog.Title>
            <Dialog.Description>
              Update booking status and internal note.
            </Dialog.Description>
          </Dialog.Header>

          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <div className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
                Status
              </div>
              <Select value={statusValue} onValueChange={setStatusValue}>
                <Select.Trigger>
                  {ORDER_STATUS_OPTIONS.find(
                    (option) => option.value === statusValue,
                  )?.label || 'Select status'}
                </Select.Trigger>
                <Select.Content>
                  {ORDER_STATUS_OPTIONS.map((option) => (
                    <Select.Item key={option.value} value={option.value}>
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
                Note
              </div>
              <Textarea
                value={noteValue}
                onChange={(event) => {
                  setNoteValue(event.target.value);
                  if (validationError) {
                    setValidationError(null);
                  }
                }}
                placeholder="Add an explanation or internal note..."
                className="min-h-28"
              />
              <p className="text-xs text-muted-foreground">
                Explanation is required for cancelled and refunded bookings.
              </p>
              {validationError && (
                <p className="text-sm text-destructive">{validationError}</p>
              )}
            </div>
          </div>

          <Dialog.Footer>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleEditOpenChange(false)}
              disabled={updating}
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={updating || !isDirty}
            >
              {updating ? 'Saving...' : 'Save Changes'}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </Sheet>
  );
};

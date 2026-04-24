'use client';

import { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Dialog,
  Select,
  Separator,
  Sheet,
  Spinner,
  Textarea,
  useConfirm,
  useToast,
} from 'erxes-ui';
import {
  IconCalendarEvent,
  IconCalendarEventFilled,
  IconCoin,
  IconFileDescription,
  IconMapPin,
  IconPackage,
  IconReceipt,
  IconUsers,
  IconWallet,
} from '@tabler/icons-react';
import { CustomersInline } from 'ui-modules';
import { useEditTourOrder, useTourOrderDetail } from '../hooks/useTourOrders';
import type { IPaymentTransaction, ITraveler } from '../hooks/useTourOrders';
import { OrderPaymentStatus } from './OrderPaymentStatus';

interface Props {
  orderId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => Promise<any> | void;
}

const ORDER_STATUS_OPTIONS = [
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const TERMINAL_STATUSES = new Set(['cancelled', 'completed']);

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmtDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function fmtDateTime(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('mn-MN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fmtMoney(amount?: number): string {
  if (amount == null) return '—';
  return amount.toLocaleString() + ' MNT';
}

// ─── Badge components ─────────────────────────────────────────────────────────

function TravelerTypePill({ type }: { type?: string }) {
  const map: Record<string, string> = {
    adult: 'bg-sky-500/10 text-sky-300',
    child: 'bg-amber-500/10 text-amber-300',
    infant: 'bg-rose-500/10 text-rose-300',
  };
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[10px] font-medium capitalize ${
        map[type ?? 'adult'] ?? map.adult
      }`}
    >
      {type}
    </span>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionLabel({
  icon: Icon,
  label,
}: {
  icon: typeof IconCoin;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs font-medium tracking-wide uppercase text-muted-foreground">
      <Icon className="w-3.5 h-3.5" />
      {label}
    </div>
  );
}

// ─── Pricing row ──────────────────────────────────────────────────────────────

function PricingLine({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex justify-between text-sm ${
        highlight ? 'font-semibold text-foreground' : 'text-muted-foreground'
      }`}
    >
      <span>{label}</span>
      <span className={highlight ? 'text-foreground' : 'text-foreground/80'}>
        {value}
      </span>
    </div>
  );
}

// ─── Transaction row ──────────────────────────────────────────────────────────

function TransactionRow({ tx }: { tx: IPaymentTransaction }) {
  const methodLabel: Record<string, string> = {
    cash: 'Cash',
    card: 'Card',
    transfer: 'Transfer',
    qpay: 'QPay',
    other: 'Other',
  };
  return (
    <div className="flex items-start justify-between gap-2 py-2 text-sm border-b last:border-0 border-border/40">
      <div className="space-y-0.5">
        <div className="font-medium text-foreground">{fmtMoney(tx.amount)}</div>
        <div className="text-xs text-muted-foreground">
          {methodLabel[tx.method] ?? tx.method}
        </div>
        {tx.note && (
          <div className="text-xs italic text-muted-foreground">{tx.note}</div>
        )}
      </div>
      <div className="text-xs text-right text-muted-foreground shrink-0">
        {fmtDateTime(tx.paidAt)}
      </div>
    </div>
  );
}

// ─── Traveler row ─────────────────────────────────────────────────────────────

function TravelerRow({
  traveler,
  index,
}: {
  traveler: ITraveler;
  index: number;
}) {
  const fallbackName =
    [traveler.firstName, traveler.lastName].filter(Boolean).join(' ') ||
    'Unnamed';

  return (
    <div className="flex items-center justify-between gap-2 py-2 border-b last:border-0 border-border/40">
      <div className="flex items-center min-w-0 gap-2">
        <Badge
          className="flex items-center justify-center h-6 min-w-6 shrink-0"
          variant="secondary"
        >
          {index + 1}
        </Badge>
        {traveler.customerId ? (
          <CustomersInline.Provider
            customerIds={[traveler.customerId]}
            placeholder={fallbackName}
          >
            <div className="flex items-center min-w-0 gap-2">
              <CustomersInline.Avatar size="sm" />
              <div className="min-w-0">
                <div className="text-sm font-medium truncate text-foreground">
                  <CustomersInline.Title />
                </div>
              </div>
            </div>
          </CustomersInline.Provider>
        ) : (
          <div className="min-w-0">
            <div className="text-sm font-medium truncate text-foreground">
              {fallbackName}
            </div>
            {traveler.passportNumber && (
              <div className="text-[11px] text-muted-foreground">
                {traveler.passportNumber}
              </div>
            )}
          </div>
        )}
      </div>
      <TravelerTypePill type={traveler.type} />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export const OrderDetailSheet = ({
  orderId,
  open,
  onOpenChange,
  onUpdated,
}: Props) => {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { order, loading, error, refetch } = useTourOrderDetail(
    orderId ?? undefined,
    open,
  );
  const { editOrder, loading: updating } = useEditTourOrder();

  const [editOpen, setEditOpen] = useState(false);
  const [statusValue, setStatusValue] = useState('');
  const [internalNoteValue, setInternalNoteValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const hasOrder = Boolean(order?._id);
  const isBusy = updating || saving;
  const isTerminal = TERMINAL_STATUSES.has(order?.status ?? '');

  const initialStatus = isTerminal ? order?.status ?? '' : '';
  const initialNote = order?.internalNote ?? '';

  useEffect(() => {
    setStatusValue(initialStatus);
    setInternalNoteValue(initialNote);
    setValidationError(null);
  }, [initialStatus, initialNote, order?._id, open]);

  useEffect(() => {
    if (!open || !order?._id) {
      setEditOpen(false);
      setValidationError(null);
    }
  }, [open, order?._id]);

  const isDirty =
    statusValue !== initialStatus || internalNoteValue !== initialNote;

  const handleEditOpen = (next: boolean) => {
    if (!next && isBusy) return;
    if (next && !order?._id) return;
    setEditOpen(next);
    if (next) {
      setStatusValue(initialStatus);
      setInternalNoteValue(initialNote);
    }
    setValidationError(null);
  };

  const handleSave = async () => {
    if (!orderId || !order?._id || !isDirty) return;
    if (!statusValue) {
      setValidationError('Please select a status');
      return;
    }
    const note = internalNoteValue.trim();
    if (TERMINAL_STATUSES.has(statusValue) && !note) {
      setValidationError(
        'An explanation is required for cancelled or refunded bookings',
      );
      return;
    }

    try {
      if (statusValue === 'cancelled' || statusValue === 'refunded') {
        await confirm({
          message: `Mark this booking as ${statusValue}?`,
          options: { confirmationValue: statusValue },
        });
      }

      setValidationError(null);
      setSaving(true);

      await editOrder({
        variables: {
          id: orderId,
          order: { status: statusValue, internalNote: note },
        },
      });

      await refetch?.();
      await onUpdated?.();

      toast({ title: 'Saved', description: 'Booking updated successfully' });
      setEditOpen(false);
    } catch (err) {
      if (err instanceof Error && err.message === 'Dialog closed') return;
      toast({
        title: 'Error',
        description:
          err instanceof Error ? err.message : 'Failed to update booking',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // ─── Derived values ──────────────────────────────────────────────────────

  const people = order?.people;
  const pricing = order?.pricing;
  const prepaid = order?.prepaid;
  const payment = order?.payment;
  const travelers = order?.travelers ?? [];
  const transactions = payment?.transactions ?? [];

  const adults = people?.adults ?? 0;
  const children = people?.children ?? 0;
  const infants = people?.infants ?? 0;

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o && isBusy) return;
        onOpenChange(o);
      }}
    >
      <Sheet.View className="w-[560px] sm:max-w-[560px] p-0 h-full flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <Spinner />
          </div>
        ) : !hasOrder ? (
          <>
            <Sheet.Header>
              <Sheet.Title>Order Details</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="flex items-center justify-center px-6 py-4 min-h-64">
              <p className="text-sm text-center text-muted-foreground">
                {error?.message ?? 'Booking details could not be loaded.'}
              </p>
            </Sheet.Content>
            <Sheet.Footer className="bg-background">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </Sheet.Footer>
          </>
        ) : (
          <>
            <Sheet.Header>
              <div className="flex items-center gap-2">
                <Sheet.Title>Order Details</Sheet.Title>
              </div>
              <Sheet.Close />
            </Sheet.Header>

            <Sheet.Content className="flex-1 px-6 py-4 space-y-4 overflow-y-auto">
              {/* ── Header card: ID + statuses ── */}
              <Card className="border-border/60 bg-background">
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        Booking ID
                      </div>
                      <div className="font-mono text-sm break-all text-foreground">
                        {order?._id}
                      </div>
                      {order?.tourName && (
                        <div className="text-xs text-muted-foreground">
                          {order.tourName}
                        </div>
                      )}
                    </div>
                    <OrderPaymentStatus
                      orderStatus={order?.status}
                      paymentStatus={payment?.status}
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <IconCalendarEvent className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {fmtDate(order?.tourStartDate)} –{' '}
                        {fmtDate(order?.tourEndDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end">
                      <IconCalendarEventFilled className="w-3.5 h-3.5 shrink-0" />
                      <span>Booked {fmtDate(order?.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* ── Primary customer ── */}
              {order?.primaryCustomerId && (
                <div className="space-y-2">
                  <SectionLabel icon={IconUsers} label="Primary Customer" />
                  <CustomersInline.Provider
                    customerIds={[order.primaryCustomerId]}
                    placeholder="Unnamed customer"
                  >
                    <Card className="bg-background border-border/60">
                      <div className="flex items-center gap-3 p-3">
                        <CustomersInline.Avatar size="xl" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate text-foreground">
                            <CustomersInline.Title />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </CustomersInline.Provider>
                </div>
              )}

              {/* ── Package + People ── */}
              <div className="space-y-2">
                <SectionLabel icon={IconPackage} label="Package & Passengers" />
                <Card className="bg-background border-border/60">
                  <div className="p-4 space-y-3">
                    {order?.package?.title && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Package</span>
                        <span className="font-medium text-right truncate text-foreground max-w-52">
                          {order.package.title}
                        </span>
                      </div>
                    )}
                    {order?.package?.accommodationType && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <IconMapPin className="w-3.5 h-3.5" />
                          Accommodation
                        </span>
                        <span className="capitalize text-foreground">
                          {order.package.accommodationType.replace(/_/g, ' ')}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {[
                        { label: 'Adults', count: adults },
                        { label: 'Children', count: children },
                        { label: 'Infants', count: infants },
                      ].map(({ label, count }) => (
                        <div
                          key={label}
                          className="p-2 border rounded-lg bg-muted/40 border-border/50"
                        >
                          <div className="text-lg font-semibold text-foreground">
                            {count}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              {/* ── Pricing breakdown ── */}
              {pricing && (
                <div className="space-y-2">
                  <SectionLabel icon={IconCoin} label="Pricing" />
                  <Card className="bg-background border-border/60">
                    <div className="p-4 space-y-2">
                      {adults > 0 && (
                        <PricingLine
                          label={`Adults (${adults} × ${fmtMoney(
                            pricing.adultPrice,
                          )})`}
                          value={fmtMoney(adults * pricing.adultPrice)}
                        />
                      )}
                      {children > 0 && (
                        <PricingLine
                          label={`Children (${children} × ${fmtMoney(
                            pricing.childPrice,
                          )})`}
                          value={fmtMoney(children * pricing.childPrice)}
                        />
                      )}
                      {infants > 0 && (
                        <PricingLine
                          label={`Infants (${infants} × ${fmtMoney(
                            pricing.infantPrice,
                          )})`}
                          value={
                            pricing.infantPrice === 0
                              ? 'Free'
                              : fmtMoney(infants * pricing.infantPrice)
                          }
                        />
                      )}
                      {pricing.domesticFlight > 0 && (
                        <PricingLine
                          label={`Domestic flight (${
                            adults + children + infants
                          } pax)`}
                          value={fmtMoney(
                            (adults + children + infants) *
                              pricing.domesticFlight,
                          )}
                        />
                      )}
                      {pricing.singleSupplement > 0 && (
                        <PricingLine
                          label="Single supplement"
                          value={fmtMoney(pricing.singleSupplement)}
                        />
                      )}
                      <Separator />
                      <PricingLine
                        label="Total"
                        value={fmtMoney(pricing.totalAmount)}
                        highlight
                      />
                    </div>
                  </Card>
                </div>
              )}

              {/* ── Prepaid ── */}
              {prepaid?.enabled && (
                <div className="space-y-2">
                  <SectionLabel icon={IconWallet} label="Advance Payment" />
                  <Card className="bg-background border-border/60">
                    <div className="p-4 space-y-2">
                      <PricingLine
                        label={`Advance required (${prepaid.percent}%)`}
                        value={fmtMoney(prepaid.amount)}
                      />
                      <PricingLine
                        label="Remaining balance"
                        value={fmtMoney(prepaid.remainingAmount)}
                        highlight
                      />
                    </div>
                  </Card>
                </div>
              )}

              {/* ── Payment ledger ── */}
              <div className="space-y-2">
                <SectionLabel icon={IconReceipt} label="Payment" />
                <Card className="bg-background border-border/60">
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Paid so far
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {fmtMoney(payment?.paidAmount ?? 0)}
                      </span>
                    </div>
                    {pricing && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Outstanding
                        </span>
                        <span className="font-medium text-foreground">
                          {fmtMoney(
                            Math.max(
                              0,
                              pricing.totalAmount - (payment?.paidAmount ?? 0),
                            ),
                          )}
                        </span>
                      </div>
                    )}
                    {transactions.length > 0 && (
                      <>
                        <Separator />
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          Transactions
                        </div>
                        <div>
                          {transactions.map((tx, i) => (
                            <TransactionRow key={i} tx={tx} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              </div>

              {/* ── Travelers ── */}
              {travelers.length > 0 && (
                <div className="space-y-2">
                  <SectionLabel
                    icon={IconUsers}
                    label={`Travelers (${travelers.length})`}
                  />
                  <Card className="bg-background border-border/60">
                    <div className="px-4 py-2">
                      {travelers.map((t, i) => (
                        <TravelerRow key={i} traveler={t} index={i} />
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* ── Notes ── */}
              {order?.note && (
                <Card className="border-border/60 bg-background">
                  <div className="p-4 space-y-2">
                    <SectionLabel icon={IconFileDescription} label="Note" />
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                      {order.note}
                    </p>
                  </div>
                </Card>
              )}

              {order?.internalNote && (
                <Card className="border-border/60 bg-background">
                  <div className="p-4 space-y-2">
                    <SectionLabel
                      icon={IconFileDescription}
                      label="Internal Note"
                    />
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                      {order.internalNote}
                    </p>
                  </div>
                </Card>
              )}
            </Sheet.Content>

            <Sheet.Footer className="bg-background">
              {!isTerminal && (
                <Button
                  variant="outline"
                  onClick={() => handleEditOpen(true)}
                  disabled={isBusy || !hasOrder}
                >
                  Edit Status
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isBusy}
              >
                Close
              </Button>
            </Sheet.Footer>
          </>
        )}
      </Sheet.View>

      {/* ── Edit dialog ── */}
      <Dialog open={editOpen} onOpenChange={handleEditOpen}>
        <Dialog.Content className="sm:max-w-md">
          <Dialog.Header>
            <Dialog.Title>Update Booking</Dialog.Title>
            <Dialog.Description>
              Change the booking status and add an internal note.
            </Dialog.Description>
          </Dialog.Header>

          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <div className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
                Status
              </div>
              <Select
                value={statusValue || undefined}
                onValueChange={(v) => {
                  setStatusValue(v);
                  setValidationError(null);
                }}
              >
                <Select.Trigger>
                  <Select.Value placeholder="Select status" />
                </Select.Trigger>
                <Select.Content>
                  {ORDER_STATUS_OPTIONS.map((opt) => (
                    <Select.Item key={opt.value} value={opt.value}>
                      {opt.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
                Internal Note
              </div>
              <Textarea
                value={internalNoteValue}
                onChange={(e) => {
                  setInternalNoteValue(e.target.value);
                  setValidationError(null);
                }}
                placeholder="Add an explanation or internal note..."
                className="min-h-28"
              />
              <p className="text-xs text-muted-foreground">
                Required for cancelled and refunded bookings.
              </p>
              {validationError && (
                <p className="text-sm text-destructive">{validationError}</p>
              )}
            </div>
          </div>

          <Dialog.Footer>
            <Button
              variant="outline"
              onClick={() => handleEditOpen(false)}
              disabled={isBusy}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isBusy || !isDirty || !statusValue || !hasOrder}
            >
              {isBusy ? 'Saving…' : 'Save Changes'}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </Sheet>
  );
};

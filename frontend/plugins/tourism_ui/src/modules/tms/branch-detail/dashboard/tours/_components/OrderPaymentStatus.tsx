import { Badge, type BadgeProps, cn } from 'erxes-ui';
import type { OrderStatus, PaymentStatus } from '../hooks/useTourOrders';

type StatusBadgeVariant = NonNullable<BadgeProps['variant']>;

type StatusBadgeConfig = {
  variant: StatusBadgeVariant;
  className: string;
  label?: string;
};

type ResolvedStatusBadge = StatusBadgeConfig & {
  label: string;
};

const DEFAULT_ORDER_STATUS: OrderStatus = 'draft';
const DEFAULT_PAYMENT_STATUS: PaymentStatus = 'pending';

const ORDER_STATUS_BADGES: Record<string, StatusBadgeConfig> = {
  confirmed: {
    variant: 'success',
    className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
  },
  completed: {
    variant: 'success',
    className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
  },
  pending: {
    variant: 'warning',
    className: 'border-amber-500/20 bg-amber-500/10 text-amber-200',
  },
  draft: {
    variant: 'secondary',
    className: 'border-border/60 bg-muted/60 text-muted-foreground',
  },
  cancelled: {
    variant: 'destructive',
    className: 'border-rose-500/25 bg-rose-500/10 text-rose-300',
  },
};

const PAYMENT_STATUS_BADGES: Record<string, StatusBadgeConfig> = {
  paid: {
    variant: 'success',
    className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
  },
  partial: {
    variant: 'warning',
    className: 'border-amber-500/20 bg-amber-500/10 text-amber-200',
  },
  pending: {
    variant: 'warning',
    className: 'border-orange-500/20 bg-orange-500/10 text-orange-200',
  },
  unpaid: {
    variant: 'warning',
    className: 'border-orange-500/20 bg-orange-500/10 text-orange-200',
  },
  refunded: {
    variant: 'secondary',
    className: 'border-border/60 bg-muted/60 text-muted-foreground',
  },
  failed: {
    variant: 'destructive',
    className: 'border-rose-500/25 bg-rose-500/10 text-rose-300',
  },
};

function normalizeStatusKey(status?: string, fallback = 'unknown') {
  const normalized = (status || fallback)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

  return normalized || fallback;
}

function formatStatusLabel(status?: string, fallback = 'Unknown') {
  return normalizeStatusKey(status, fallback)
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getStatusBadge(
  status: string | undefined,
  configMap: Record<string, StatusBadgeConfig>,
  fallbackStatus: string,
): ResolvedStatusBadge {
  const statusKey = normalizeStatusKey(status, fallbackStatus);
  const fallbackKey = normalizeStatusKey(fallbackStatus);
  const config = configMap[statusKey] ?? configMap[fallbackKey];

  return {
    ...config,
    label: config.label ?? formatStatusLabel(status ?? fallbackStatus),
  };
}

function ContextStatusBadge({
  contextLabel,
  status,
  primary,
  subdued,
}: Readonly<{
  contextLabel: string;
  status: ResolvedStatusBadge;
  primary?: boolean;
  subdued?: boolean;
}>) {
  return (
    <Badge
      variant={status.variant}
      className={cn(
        'gap-1.5 rounded-full px-2.5 py-0 leading-none shadow-none',
        primary ? 'h-6 text-[11px]' : 'h-5 text-[10px]',
        status.className,
        subdued && 'opacity-80',
      )}
    >
      <span className="text-[9px] font-semibold uppercase tracking-wide opacity-65">
        {contextLabel}
      </span>
      <span className="h-2.5 w-px bg-current opacity-20" />
      <span className="size-1.5 rounded-full bg-current opacity-75" />
      {status.label}
    </Badge>
  );
}

export function OrderPaymentStatus({
  orderStatus,
  paymentStatus,
  className,
}: Readonly<{
  orderStatus?: string;
  paymentStatus?: string;
  className?: string;
}>) {
  const order = getStatusBadge(
    orderStatus,
    ORDER_STATUS_BADGES,
    DEFAULT_ORDER_STATUS,
  );
  const payment = getStatusBadge(
    paymentStatus,
    PAYMENT_STATUS_BADGES,
    DEFAULT_PAYMENT_STATUS,
  );
  const isCancelled = normalizeStatusKey(orderStatus) === 'cancelled';

  return (
    <div
      aria-label="Order and payment status"
      className={cn('flex shrink-0 flex-col items-end gap-1.5', className)}
    >
      <ContextStatusBadge
        contextLabel="Order"
        status={order}
        primary={isCancelled}
      />
      <ContextStatusBadge
        contextLabel="Payment"
        status={payment}
        subdued={isCancelled}
      />
    </div>
  );
}

import { cn, formatAmount } from 'erxes-ui';

const VALUE_SIZES = {
  sm: 'text-sm',
  lg: 'text-lg tracking-tight',
  xl: 'text-xl leading-tight tracking-tight @2xl:text-2xl',
};

export const DealAmounts = ({
  amounts,
  size = 'sm',
  showZero = false,
  className,
}: {
  amounts: Record<string, number>;
  size?: keyof typeof VALUE_SIZES;
  showZero?: boolean;
  className?: string;
}) => {
  const entries = Object.entries(amounts);
  const shown = entries.length || !showZero ? entries : [['', 0] as const];

  if (!shown.length) {
    return null;
  }

  return (
    <span className={cn('flex flex-wrap items-baseline gap-x-3', className)}>
      {shown.map(([currency, value]) => (
        <span
          key={currency}
          className="flex items-baseline gap-1 whitespace-nowrap"
        >
          <span
            className={cn(
              'font-semibold tabular-nums text-foreground',
              VALUE_SIZES[size],
            )}
          >
            {formatAmount(value)}
          </span>
          {currency && (
            <span className="text-xs font-normal text-muted-foreground">
              {currency}
            </span>
          )}
        </span>
      ))}
    </span>
  );
};

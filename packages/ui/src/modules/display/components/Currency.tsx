import type { ComponentProps } from 'react';
import { CURRENCY_CODES, type CurrencyCode } from 'erxes-ui/constants/CurrencyCodes';
import { cn } from 'erxes-ui/lib/utils';
import { formatAmount } from 'erxes-ui/lib/format';

/**
 * A currency by its code: its icon and name, its icon alone, or its code.
 * `variant` picks which: `label` (the default), `icon` or `code`.
 */
export const CurrencyDisplay = ({
  code,
  variant = 'label',
  className,
  ...props
}: ComponentProps<'div'> & {
  code?: CurrencyCode;
  variant?: 'icon' | 'label' | 'code';
}) => {
  const currency = code ? CURRENCY_CODES[code] : undefined;
  const CurrencyIcon = currency?.Icon;

  if (variant === 'icon' && CurrencyIcon) return <CurrencyIcon className="size-4" />;

  if (variant !== 'label') return <span className="mr-auto text-muted-foreground">{code}</span>;

  return (
    <div className={cn('flex items-center gap-2', className)} {...props}>
      {CurrencyIcon && <CurrencyIcon className="size-4" />}
      <span className="mr-auto">{currency?.label}</span>
    </div>
  );
};

/**
 * An amount after its currency's icon, through `formatAmount`.
 * `kind="short"` shows "1.2k". Without a currency it shows 0, as 3.x did.
 */
export const CurrencyFormatedDisplay = ({
  currencyValue,
  kind,
}: {
  /** The amount as a plain decimal (not minor units), and its currency. */
  currencyValue?: { currencyCode?: CurrencyCode | null; amountMicros?: number | null } | null;
  kind?: 'short' | 'finance';
}) => {
  const code = currencyValue?.currencyCode;
  const amount = currencyValue?.amountMicros;
  const CurrencyIcon = code ? CURRENCY_CODES[code].Icon : undefined;

  return (
    <div className="flex w-full max-w-full items-center overflow-hidden text-ellipsis whitespace-nowrap">
      {!code && 0}
      {code && CurrencyIcon && amount != null && (
        <CurrencyIcon className="size-4 text-muted-foreground" />
      )}
      {code && amount != null && formatAmount(amount, kind)}
    </div>
  );
};

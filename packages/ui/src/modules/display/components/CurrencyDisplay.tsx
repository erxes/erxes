import React from 'react';

import { CURRENCY_CODES } from 'erxes-ui/constants/CurrencyCodes';
import { FieldCurrencyValue } from 'erxes-ui/types/Displays';
import { isDefined, isUndefinedOrNull } from 'erxes-ui/utils';
import { formatAmount } from 'erxes-ui/utils/format';
import { EllipsisDisplay } from './EllipsisDisplay';
import { cn } from 'erxes-ui/lib';
import { CurrencyCode } from 'erxes-ui/types';

type CurrencyFormatedDisplayProps = {
  currencyValue?: FieldCurrencyValue | null;
  kind?: 'short' | 'finance'
};

export const CurrencyFormatedDisplay = ({
  currencyValue,
  kind
}: CurrencyFormatedDisplayProps) => {
  const shouldDisplayCurrency = isDefined(currencyValue?.currencyCode);

  const CurrencyIcon = isDefined(currencyValue?.currencyCode)
    ? CURRENCY_CODES[currencyValue?.currencyCode]?.Icon
    : null;

  const amountToDisplay = isUndefinedOrNull(currencyValue?.amountMicros)
    ? null
    : currencyValue?.amountMicros * 1000000 / 1000000;

  if (!shouldDisplayCurrency) {
    return <EllipsisDisplay>{0}</EllipsisDisplay>;
  }

  return (
    <EllipsisDisplay>
      {isDefined(CurrencyIcon) && amountToDisplay !== null && (
        <CurrencyIcon className="size-4 text-muted-foreground" />
      )}
      {amountToDisplay !== null ? formatAmount(amountToDisplay, kind) : ''}
    </EllipsisDisplay>
  );
};

export interface CurrencyDisplayProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Currency code to display */
  code?: CurrencyCode;
  variant?: 'icon' | 'label' | 'code';
}

export const CurrencyDisplay = React.forwardRef<
  HTMLDivElement,
  CurrencyDisplayProps
>(({ code, variant = 'label', className, ...props }, ref) => {
  const currency = code ? CURRENCY_CODES[code] : undefined;
  const CurrencyIcon = currency?.Icon;

  if (variant === 'icon' && CurrencyIcon) {
    return <CurrencyIcon className="size-4" />;
  }

  if (variant === 'code' || variant === 'icon') {
    return <span className="text-muted-foreground mr-auto">{code}</span>;
  }

  return (
    <div
      ref={ref}
      className={cn('flex items-center gap-2', className)}
      {...props}
    >
      {CurrencyIcon && <CurrencyIcon className="size-4" />}
      <span className="mr-auto">{currency?.label}</span>
    </div>
  );
});

CurrencyDisplay.displayName = 'CurrencyDisplay';

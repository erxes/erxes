import React from 'react';
import { Input, cn } from 'erxes-ui';

interface PricingTimeSelectProps
  extends Omit<
    React.ComponentProps<typeof Input>,
    'type' | 'value' | 'onChange'
  > {
  value?: string | null;
  onValueChange?: (value?: string | null) => void;
}

export const PricingTimeSelect = React.forwardRef<
  HTMLInputElement,
  PricingTimeSelectProps
>(({ value, onValueChange, className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      type="time"
      value={value || ''}
      onChange={(e) => onValueChange?.(e.target.value || null)}
      className={cn('w-full h-9 text-sm', className)}
      {...props}
    />
  );
});

PricingTimeSelect.displayName = 'PricingTimeSelect';

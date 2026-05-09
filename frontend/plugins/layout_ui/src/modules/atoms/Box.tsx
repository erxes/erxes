import * as React from 'react';
import { cn } from 'erxes-ui';

export type BoxProps = React.HTMLAttributes<HTMLDivElement> & {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  bordered?: boolean;
};

const paddingMap: Record<NonNullable<BoxProps['padding']>, string> = {
  none: 'p-0',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
};

export const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ className, padding = 'none', bordered, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'h-full w-full',
        paddingMap[padding],
        bordered && 'rounded-md border bg-background',
        className,
      )}
      {...props}
    />
  ),
);
Box.displayName = 'Box';

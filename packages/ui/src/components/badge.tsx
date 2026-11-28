import React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../lib/utils';
import { buttonVariants } from './button';
import { IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

/** The badge's classes by `variant` and `size`, to style another element. */
export const badgeVariants = cva(
  'inline-flex items-center rounded-sm transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap font-medium w-fit border gap-1 [&>svg]:shrink-0 [&>svg:not([class*=size-])]:size-3.5',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary-text border-primary/10',
        secondary: 'bg-accent',
        /** A count of what didn't fit ("+3"). */
        muted: 'bg-accent text-muted-foreground',
        ghost: 'hover:bg-accent border-none hover:shadow-xs',
        success: 'bg-success/10 text-(--success-text) border-success/10',
        warning: 'bg-warning/10 text-(--warning-text) border-warning/10',
        destructive: 'bg-destructive/10 text-destructive-text border-destructive/10',
        info: 'bg-info/10 text-(--info-text) border-info/10',
      },
      size: {
        default: 'h-6 px-2 text-xs',
        /** A tag inside a line of text: a source, a priority. */
        sm: 'h-4 px-1.5 text-3xs [&>svg:not([class*=size-])]:size-2.5',
        lg: 'h-7 px-2.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

/** Div props plus `variant`, `size` and `onClose`, which adds a remove x. */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  onClose?: () => void;
}

/** The x that removes a badge: a button, so the keyboard reaches it and it has a name. */
const BadgeRemove = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation('ui', { keyPrefix: 'badge' });

  return (
    <button
      type="button"
      aria-label={t('remove', 'Remove')}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      className={cn(
        buttonVariants({ variant: 'ghost', size: 'icon' }),
        'size-3.5 p-0 hover:bg-transparent flex-none',
      )}
    >
      <IconX />
    </button>
  );
};

/** A small tinted label for a status, tag or count; `onClose` adds an x. */
export const Badge = ({
  ref,
  className,
  variant,
  size,
  children,
  onClose,
  ...props
}: BadgeProps & React.RefAttributes<HTMLDivElement>) => {
  return (
    <div
      ref={ref}
      className={cn(badgeVariants({ variant, size }), onClose && 'pr-1', className)}
      {...props}
    >
      {children}
      {onClose && <BadgeRemove onClose={onClose} />}
    </div>
  );
};

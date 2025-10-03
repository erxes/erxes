import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../lib/utils';
import { Button } from './button';
import { IconX } from '@tabler/icons-react';

export const badgeVariants = cva(
  'inline-flex items-center rounded-sm px-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap font-medium w-fit h-6 text-xs border gap-1',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary border-primary/10',
        secondary: 'bg-accent',
        success: 'bg-success/10 text-success border-success/10',
        warning: 'bg-warning/10 text-warning border-warning/10',
        destructive: 'bg-destructive/10 text-destructive border-destructive/10',
        info: 'bg-info/10 text-info border-info/10',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  onClose?: () => void;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, children, onClose, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), onClose && 'pr-1', className)}
        {...props}
      >
        {children}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="size-3.5 p-0 hover:bg-transparent flex-none"
            asChild
          >
            <IconX className="size-3.5 flex-none" />
          </Button>
        )}
      </div>
    );
  },
);

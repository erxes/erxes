import { Badge, cn } from 'erxes-ui';

import { PROJECT_PRIORITIES_OPTIONS } from '@/deals/constants/cards';
import React from 'react';

export const PriorityIcon = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement> & { priority: number }
>(({ priority, className, ...props }, ref) => {
  const color = [
    'text-muted-foreground',
    'text-success',
    'text-info',
    'text-warning',
    'text-destructive',
  ][priority];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={3}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-4', color, className)}
      {...props}
      ref={ref}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path
        d="M6 18l0 -3"
        className={priority > 0 ? 'stroke-current' : 'stroke-scroll'}
      />
      <path
        d="M10 18l0 -6"
        className={priority > 1 ? 'stroke-current' : 'stroke-scroll'}
      />
      <path
        d="M14 18l0 -9"
        className={priority > 2 ? 'stroke-current' : 'stroke-scroll'}
      />
      <path
        d="M18 18l0 -12"
        className={priority > 3 ? 'stroke-current' : 'stroke-scroll'}
      />
    </svg>
  );
});

PriorityIcon.displayName = 'PriorityIcon';

export const PriorityTitle = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> & { priority: number }
>(({ priority, className, ...props }, ref) => {
  const text = PROJECT_PRIORITIES_OPTIONS[priority];
  return (
    <span
      ref={ref}
      className={cn(
        'font-medium',
        priority === 0 && 'text-muted-foreground',
        className,
      )}
      {...props}
    >
      {text}
    </span>
  );
});

PriorityTitle.displayName = 'PriorityTitle';

export const PriorityBadge = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Badge> & { priority?: number }
>(({ priority, ...props }, ref) => {
  const variant = ['secondary', 'success', 'info', 'warning', 'destructive'][
    priority ?? 0
  ];
  return (
    <Badge ref={ref} variant={variant as any} {...props}>
      <PriorityIcon priority={priority ?? 0} />
      <PriorityTitle priority={priority ?? 0} />
    </Badge>
  );
});

PriorityBadge.displayName = 'PriorityBadge';

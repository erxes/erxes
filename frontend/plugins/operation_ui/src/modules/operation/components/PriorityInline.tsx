import { PROJECT_PRIORITIES_OPTIONS } from '@/operation/constants/priorityLabels';
import { Badge, cn } from 'erxes-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const PriorityIcon = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement> & { priority?: number | null }
>(({ priority, className, ...props }, ref) => {
  const level = priority ?? 0;
  const color = [
    'text-muted-foreground',
    'text-success',
    'text-info',
    'text-warning',
    'text-destructive',
  ][level];

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
        className={level > 0 ? 'stroke-current' : 'stroke-scroll'}
      />
      <path
        d="M10 18l0 -6"
        className={level > 1 ? 'stroke-current' : 'stroke-scroll'}
      />
      <path
        d="M14 18l0 -9"
        className={level > 2 ? 'stroke-current' : 'stroke-scroll'}
      />
      <path
        d="M18 18l0 -12"
        className={level > 3 ? 'stroke-current' : 'stroke-scroll'}
      />
    </svg>
  );
});

PriorityIcon.displayName = 'PriorityIcon';

export const PriorityTitle = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> & { priority?: number | null }
>(({ priority, className, ...props }, ref) => {
  const { t } = useTranslation('operation');
  const level = priority ?? 0;
  const text = PROJECT_PRIORITIES_OPTIONS[level];
  return (
    <span
      ref={ref}
      className={cn(
        'font-medium',
        level === 0 && 'text-muted-foreground',
        className,
      )}
      {...props}
    >
      {text ? t(text) : ''}
    </span>
  );
});

PriorityTitle.displayName = 'PriorityTitle';

const PRIORITY_BADGE_VARIANTS = [
  'secondary',
  'success',
  'info',
  'warning',
  'destructive',
] as const;

export const PriorityBadge = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Badge> & { priority?: number | null }
>(({ priority, ...props }, ref) => {
  const variant = PRIORITY_BADGE_VARIANTS[priority ?? 0];
  return (
    <Badge ref={ref} variant={variant} {...props}>
      <PriorityIcon priority={priority} />
      <PriorityTitle priority={priority} />
    </Badge>
  );
});

PriorityBadge.displayName = 'PriorityBadge';

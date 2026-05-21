import { Badge, cn } from 'erxes-ui';
import React from 'react';

import {
  DEFAULT_RISK_LEVEL,
  RISK_LEVEL_BADGE_VARIANTS,
  RISK_LEVEL_DOT_CLASSES,
  RISK_LEVEL_LABELS,
  RISK_LEVEL_OPTIONS,
  TRiskLevel,
} from '@/deals/constants/riskLevel';

const asRiskLevel = (value?: string): TRiskLevel =>
  (RISK_LEVEL_OPTIONS as readonly string[]).includes(value ?? '')
    ? (value as TRiskLevel)
    : DEFAULT_RISK_LEVEL;

export const RiskLevelDot = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> & { level?: string }
>(({ level, className, ...props }, ref) => {
  const value = asRiskLevel(level);
  return (
    <span
      ref={ref}
      data-risk-level={value}
      className={cn(
        'inline-block size-2 rounded-full',
        RISK_LEVEL_DOT_CLASSES[value],
        className,
      )}
      {...props}
    />
  );
});

RiskLevelDot.displayName = 'RiskLevelDot';

export const RiskLevelTitle = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> & { level?: string }
>(({ level, className, ...props }, ref) => {
  const value = asRiskLevel(level);
  return (
    <span ref={ref} className={cn('font-medium', className)} {...props}>
      {RISK_LEVEL_LABELS[value]}
    </span>
  );
});

RiskLevelTitle.displayName = 'RiskLevelTitle';

export const RiskLevelBadge = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Badge> & { level?: string }
>(({ level, ...props }, ref) => {
  const value = asRiskLevel(level);
  return (
    <Badge
      ref={ref}
      variant={RISK_LEVEL_BADGE_VARIANTS[value]}
      data-risk-level={value}
      aria-label={`Risk: ${RISK_LEVEL_LABELS[value]}`}
      {...props}
    >
      <RiskLevelDot level={value} />
      <RiskLevelTitle level={value} />
    </Badge>
  );
});

RiskLevelBadge.displayName = 'RiskLevelBadge';

export const RISK_LEVEL_OPTIONS = ['low', 'medium', 'high'] as const;

export type TRiskLevel = (typeof RISK_LEVEL_OPTIONS)[number];

export const DEFAULT_RISK_LEVEL: TRiskLevel = 'low';

export const RISK_LEVEL_LABELS: Record<TRiskLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const RISK_LEVEL_DOT_CLASSES: Record<TRiskLevel, string> = {
  low: 'bg-success',
  medium: 'bg-warning',
  high: 'bg-destructive',
};

export const RISK_LEVEL_BADGE_VARIANTS: Record<
  TRiskLevel,
  'success' | 'warning' | 'destructive'
> = {
  low: 'success',
  medium: 'warning',
  high: 'destructive',
};

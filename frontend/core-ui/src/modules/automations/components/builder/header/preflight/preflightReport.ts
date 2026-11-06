export const PREFLIGHT_CHECK_KEYS = [
  'types',
  'links',
  'reach',
  'segment',
  'settings',
  'records',
  'references',
  'owners',
] as const;

export type TPreflightCheckKey = (typeof PREFLIGHT_CHECK_KEYS)[number];

export type TPreflightStatus = 'ok' | 'bad' | 'warn';

export type TPreflightItem = {
  nodeId: string;
  message: string;
};

export type TPreflightCheck = {
  key: TPreflightCheckKey;
  status: TPreflightStatus;
  ms?: number;
  items: TPreflightItem[];
};

export type TPreflightReport = {
  canActivate: boolean;
  checks: TPreflightCheck[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const isCheckKey = (value: unknown): value is TPreflightCheckKey =>
  PREFLIGHT_CHECK_KEYS.some((key) => key === value);

const toStatus = (value: unknown): TPreflightStatus =>
  value === 'bad' || value === 'warn' ? value : 'ok';

/** The automationValidate JSON as the preflight reads it; unknown checks are dropped. */
export const toPreflightReport = (value: unknown): TPreflightReport | null => {
  if (!isRecord(value) || !Array.isArray(value.checks)) {
    return null;
  }

  const checks = value.checks.filter(isRecord).flatMap((check) =>
    isCheckKey(check.key)
      ? [
          {
            key: check.key,
            status: toStatus(check.status),
            ...(typeof check.ms === 'number' && { ms: check.ms }),
            items: (Array.isArray(check.items) ? check.items : [])
              .filter(isRecord)
              .map((item) => ({
                nodeId: String(item.nodeId || ''),
                message: String(item.message || ''),
              })),
          },
        ]
      : [],
  );

  return { canActivate: value.canActivate === true, checks };
};

const STATUS_RANK: Record<TPreflightStatus, number> = {
  bad: 0,
  warn: 1,
  ok: 2,
};

/** Failures first once every check is in, so the eye lands on them. */
export const byUrgency = (checks: TPreflightCheck[]) =>
  [...checks].sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status]);

/**
 * What an action does when it fails. Written by the builder onto the action's
 * own config, read by the engine — the default keeps today's behaviour, where
 * a failed action fails the run.
 *
 * 'branch' turns the action's single outgoing edge into a named pair, so a
 * tolerated failure is something the canvas shows rather than a setting buried
 * in a dialog.
 */
export const AUTOMATION_ERROR_BEHAVIOURS = {
  FAIL: 'fail',
  BRANCH: 'branch',
} as const;

/** Config keys the branch writes its two targets to. */
export const AUTOMATION_BRANCH_KEYS = {
  SUCCESS: 'onSuccessActionId',
  ERROR: 'onErrorActionId',
} as const;

export type TAutomationErrorBehaviour =
  (typeof AUTOMATION_ERROR_BEHAVIOURS)[keyof typeof AUTOMATION_ERROR_BEHAVIOURS];

export const AUTOMATION_RETRY_BACKOFFS = {
  NONE: 'none',
  LINEAR: 'linear',
  EXPONENTIAL: 'exponential',
} as const;

export type TAutomationRetryBackoff =
  (typeof AUTOMATION_RETRY_BACKOFFS)[keyof typeof AUTOMATION_RETRY_BACKOFFS];

/** A retry parks a live execution, so the ceilings are the platform's. */
export const AUTOMATION_RETRY_LIMITS = {
  MAX_ATTEMPTS: 5,
  DEFAULT_DELAY_SECONDS: 60,
  MIN_DELAY_SECONDS: 5,
  MAX_DELAY_SECONDS: 3600,
} as const;

export type TAutomationActionErrorPolicy = {
  retry?: {
    // Extra tries after the first one. 0 means no retry.
    attempts?: number;
    delaySeconds?: number;
    backoff?: TAutomationRetryBackoff;
  };
  onError?: TAutomationErrorBehaviour;
};

export type TAutomationBranchConfig = {
  errorPolicy?: TAutomationActionErrorPolicy;
  [AUTOMATION_BRANCH_KEYS.SUCCESS]?: string;
  [AUTOMATION_BRANCH_KEYS.ERROR]?: string;
};

export type TResolvedActionErrorPolicy = {
  attempts: number;
  delaySeconds: number;
  backoff: TAutomationRetryBackoff;
  onError: TAutomationErrorBehaviour;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const asActionId = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const toCount = (value: unknown, fallback: number) => {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? Math.floor(parsed) : fallback;
};

const isBackoff = (value: unknown): value is TAutomationRetryBackoff =>
  value === AUTOMATION_RETRY_BACKOFFS.NONE ||
  value === AUTOMATION_RETRY_BACKOFFS.LINEAR ||
  value === AUTOMATION_RETRY_BACKOFFS.EXPONENTIAL;

/**
 * Reads the policy off an action config. Anything missing or out of range
 * falls back to the platform's own values, so a hand-edited automation can
 * never park an execution for longer than the ceiling allows.
 */
export const resolveActionErrorPolicy = (
  config: unknown,
): TResolvedActionErrorPolicy => {
  const policy =
    isRecord(config) && isRecord(config.errorPolicy)
      ? (config.errorPolicy as TAutomationActionErrorPolicy)
      : {};
  const retry = isRecord(policy.retry) ? policy.retry : {};
  const {
    MAX_ATTEMPTS,
    DEFAULT_DELAY_SECONDS,
    MIN_DELAY_SECONDS,
    MAX_DELAY_SECONDS,
  } = AUTOMATION_RETRY_LIMITS;

  return {
    attempts: clamp(toCount(retry.attempts, 0), 0, MAX_ATTEMPTS),
    delaySeconds: clamp(
      toCount(retry.delaySeconds, DEFAULT_DELAY_SECONDS),
      MIN_DELAY_SECONDS,
      MAX_DELAY_SECONDS,
    ),
    backoff: isBackoff(retry.backoff)
      ? retry.backoff
      : AUTOMATION_RETRY_BACKOFFS.NONE,
    onError:
      policy.onError === AUTOMATION_ERROR_BEHAVIOURS.BRANCH
        ? AUTOMATION_ERROR_BEHAVIOURS.BRANCH
        : AUTOMATION_ERROR_BEHAVIOURS.FAIL,
  };
};

/**
 * Where the action goes next. A branching action names both of its exits, so
 * the plain `nextActionId` is only read while the policy is off.
 */
export const resolveActionBranchTarget = (
  action: { nextActionId?: string; config?: unknown },
  outcome: 'success' | 'error',
): string | undefined => {
  const config = isRecord(action?.config) ? action.config : {};
  const branching =
    resolveActionErrorPolicy(config).onError ===
    AUTOMATION_ERROR_BEHAVIOURS.BRANCH;

  if (!branching) {
    return outcome === 'success' ? action?.nextActionId : undefined;
  }

  const key =
    outcome === 'success'
      ? AUTOMATION_BRANCH_KEYS.SUCCESS
      : AUTOMATION_BRANCH_KEYS.ERROR;

  return asActionId(config[key]);
};

/** Wait before attempt `nextAttempt` (2 is the first retry). */
export const actionRetryDelayMs = (
  policy: TResolvedActionErrorPolicy,
  nextAttempt: number,
) => {
  const step = Math.max(nextAttempt - 1, 1);
  const { backoff, delaySeconds } = policy;

  const seconds =
    backoff === AUTOMATION_RETRY_BACKOFFS.LINEAR
      ? delaySeconds * step
      : backoff === AUTOMATION_RETRY_BACKOFFS.EXPONENTIAL
      ? delaySeconds * Math.pow(2, step - 1)
      : delaySeconds;

  return clamp(seconds, 0, AUTOMATION_RETRY_LIMITS.MAX_DELAY_SECONDS) * 1000;
};

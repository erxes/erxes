import { AUTOMATION_ERROR_CODES, TAutomationErrorCode } from './constants';

/**
 * An action states how it went. Without this envelope the engine can only read
 * "did not throw", which reports a refused send and a deliberate skip alike.
 */
export const AUTOMATION_ACTION_OUTCOMES = {
  SUCCESS: 'success',
  SKIPPED: 'skipped',
  FAILED: 'failed',
} as const;

export type TAutomationActionOutcome =
  (typeof AUTOMATION_ACTION_OUTCOMES)[keyof typeof AUTOMATION_ACTION_OUTCOMES];

type TOutcomeDeclaration =
  | { status: typeof AUTOMATION_ACTION_OUTCOMES.SUCCESS }
  | { status: typeof AUTOMATION_ACTION_OUTCOMES.SKIPPED; reason: string }
  | {
      status: typeof AUTOMATION_ACTION_OUTCOMES.FAILED;
      message: string;
      code?: TAutomationErrorCode;
    };

export type TAutomationActionOutcomeEnvelope = {
  outcome: TOutcomeDeclaration;
  result?: unknown;
};

export type TResolvedActionOutcome =
  | { status: typeof AUTOMATION_ACTION_OUTCOMES.SUCCESS; result: unknown }
  | {
      status: typeof AUTOMATION_ACTION_OUTCOMES.SKIPPED;
      reason: string;
      result: unknown;
    }
  | {
      status: typeof AUTOMATION_ACTION_OUTCOMES.FAILED;
      message: string;
      code: TAutomationErrorCode;
      result: unknown;
    };

const UNSPECIFIED_SKIP_REASON = 'unspecified';
const UNSPECIFIED_FAILURE_MESSAGE = 'Action reported a failure';

/** The work was deliberately not done, and the flow carries on. */
export const buildSkippedAction = (
  reason: string,
  result?: unknown,
): TAutomationActionOutcomeEnvelope => ({
  outcome: { status: AUTOMATION_ACTION_OUTCOMES.SKIPPED, reason },
  result,
});

/** The work was meant to happen and did not. */
export const buildFailedAction = (
  message: string,
  code?: TAutomationErrorCode,
  result?: unknown,
): TAutomationActionOutcomeEnvelope => ({
  outcome: { status: AUTOMATION_ACTION_OUTCOMES.FAILED, message, code },
  result,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isDeclaredStatus = (value: unknown): value is TAutomationActionOutcome =>
  value === AUTOMATION_ACTION_OUTCOMES.SUCCESS ||
  value === AUTOMATION_ACTION_OUTCOMES.SKIPPED ||
  value === AUTOMATION_ACTION_OUTCOMES.FAILED;

/** For callers that forward an action's answer without reading it. */
export const isActionOutcomeEnvelope = (
  value: unknown,
): value is TAutomationActionOutcomeEnvelope =>
  isRecord(value) &&
  isRecord(value.outcome) &&
  isDeclaredStatus(value.outcome.status);

const asString = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;

/**
 * Anything that is not a well-formed envelope is the action's own payload, so
 * every existing action keeps reporting exactly as it does today.
 */
export const resolveActionOutcome = (
  actionResponse: unknown,
): TResolvedActionOutcome => {
  const asSuccess = {
    status: AUTOMATION_ACTION_OUTCOMES.SUCCESS,
    result: actionResponse,
  } as const;

  if (!isRecord(actionResponse) || !isRecord(actionResponse.outcome)) {
    return asSuccess;
  }

  const { outcome, result } = actionResponse;
  const status = outcome.status;

  if (status === AUTOMATION_ACTION_OUTCOMES.SKIPPED) {
    return {
      status,
      reason: asString(outcome.reason) ?? UNSPECIFIED_SKIP_REASON,
      result,
    };
  }

  if (status === AUTOMATION_ACTION_OUTCOMES.FAILED) {
    const code = asString(outcome.code) as TAutomationErrorCode | undefined;

    return {
      status,
      message: asString(outcome.message) ?? UNSPECIFIED_FAILURE_MESSAGE,
      code: code ?? AUTOMATION_ERROR_CODES.UNKNOWN,
      result,
    };
  }

  if (status === AUTOMATION_ACTION_OUTCOMES.SUCCESS) {
    return { status, result };
  }

  return asSuccess;
};

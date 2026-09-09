import {
  AUTOMATION_ERROR_CODES,
  TAutomationErrorCode,
} from 'erxes-api-shared/core-modules';
import { classifyError } from 'erxes-api-shared/utils';

/**
 * Thrown where the reason is already known, so the code never has to be
 * guessed back out of the message text.
 */
export class AutomationActionError extends Error {
  readonly errorCode: TAutomationErrorCode;
  // Structured evidence from the failure, persisted onto the exec action so a
  // cause can be read back later instead of guessed from the message.
  readonly result?: unknown;

  constructor(
    message: string,
    errorCode: TAutomationErrorCode,
    result?: unknown,
  ) {
    super(message);
    this.name = 'AutomationActionError';
    this.errorCode = errorCode;
    this.result = result;
    Object.setPrototypeOf(this, AutomationActionError.prototype);
  }
}

// Outgoing webhook failures already carry a structured phase.
const WEBHOOK_PHASE_CODES: Record<string, TAutomationErrorCode> = {
  timeout: AUTOMATION_ERROR_CODES.WEBHOOK_TIMEOUT,
  network: AUTOMATION_ERROR_CODES.WEBHOOK_NETWORK_FAILED,
  'response-parse': AUTOMATION_ERROR_CODES.WEBHOOK_BAD_RESPONSE,
  build: AUTOMATION_ERROR_CODES.CONFIG_INVALID,
};

const getWebhookPhase = (error: unknown) =>
  (error as { result?: { error?: { phase?: string } } })?.result?.error?.phase;

/**
 * Explicit code first, then the webhook phase, and only then the shared
 * classifier. No message patterns are matched here — rewording an error must
 * never move it to another bucket.
 */
export const resolveAutomationErrorCode = (
  error: unknown,
): TAutomationErrorCode => {
  if (error instanceof AutomationActionError) {
    return error.errorCode;
  }

  const phase = getWebhookPhase(error);

  if (phase) {
    return WEBHOOK_PHASE_CODES[phase] ?? AUTOMATION_ERROR_CODES.WEBHOOK_FAILED;
  }

  switch (classifyError(error).category) {
    case 'PROVIDER':
      return AUTOMATION_ERROR_CODES.PROVIDER_ERROR;
    case 'SYSTEM':
      return AUTOMATION_ERROR_CODES.INTERNAL_ERROR;
    case 'EXPECTED':
      return AUTOMATION_ERROR_CODES.BUSINESS_ERROR;
    default:
      return AUTOMATION_ERROR_CODES.UNKNOWN;
  }
};

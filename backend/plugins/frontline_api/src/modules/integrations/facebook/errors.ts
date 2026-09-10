/**
 * Meta's `code` and `error_subcode` are logged by `sendReply` but were dropped
 * from the thrown error, which is why a third of the failures on the 2026-09-07
 * dump could not be classified. They ride along here instead.
 */
export class FacebookSendError extends Error {
  constructor(
    message: string,
    readonly code?: number,
    readonly subcode?: number,
  ) {
    super(message);
    this.name = 'FacebookSendError';
  }
}

/** Calls to this api have exceeded the rate limit. */
const RATE_LIMIT_CODE = 613;
const SPAM_MESSAGE = 'Community Standards on spam';

/**
 * Whether Facebook is telling the page to stop, rather than rejecting one
 * message. Both answers mean every further send on this page will fail too.
 */
export const isSendThrottledError = (error: unknown) => {
  const { message = '', code } = (error || {}) as FacebookSendError;

  return code === RATE_LIMIT_CODE || message.includes(SPAM_MESSAGE);
};

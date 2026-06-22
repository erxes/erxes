// Turns a raw GraphQL error from the gateway into a clean, model-usable result.
// erxes server resolvers sometimes CRASH on missing/empty args (e.g.
// getTicketPipelines → "Cannot read properties of undefined (reading 'name')",
// salesPipelines → "Cannot return null for non-nullable field …") instead of
// validating. Those internal stack-ish messages must never reach the user, and
// the model should be told to provide the required arguments rather than retry
// the same empty call.
export const INTERNAL_ERROR_RE =
  /cannot read propert|undefined \(reading|return null for non-nullable|is not a function|reading '/i;
// Stack-frame heuristic without super-linear backtracking: a " at " marker
// plus a ":line:col)" suffix anywhere in the message.
export const STACK_FRAME_RE = /:\d+:\d+\)/;
/** True when the message looks like a raw stack frame rather than a user error. */
export const looksLikeStackFrame = (msg: string): boolean =>
  msg.includes(' at ') && STACK_FRAME_RE.test(msg);
export const REQUIRED_ARG_RE =
  /argument "([^"]+)" of type|"([^"]+)" is required|required, but it was not provided|was not provided/i;

/** Turn a raw gateway error into a clean, model-usable { error, instruction }. */
export function sanitizeServerError(raw: string): {
  error: string;
  instruction: string;
} {
  const msg = (raw || '').trim();
  const reqMatch = msg.match(REQUIRED_ARG_RE);
  if (reqMatch && !INTERNAL_ERROR_RE.test(msg) && !looksLikeStackFrame(msg)) {
    // Clean validation error — surface it; it tells the model what to supply.
    return {
      error: msg,
      instruction:
        "This operation needs one or more required arguments. Re-read the operation's argument list from search_erxes_operations and call it again WITH those arguments filled in — never call it with empty args.",
    };
  }
  if (INTERNAL_ERROR_RE.test(msg) || looksLikeStackFrame(msg)) {
    // Internal server crash — hide the stack-ish detail entirely.
    return {
      error:
        'That operation could not be completed (the service rejected the request).',
      instruction:
        'Do NOT show this technical detail to the user and do NOT retry the same call. The operation likely needs required arguments you did not provide, or is not usable this way. Provide the required arguments, choose a different operation, or skip this step and continue.',
    };
  }
  return {
    error: msg,
    instruction:
      'Tell the user in plain words; do not retry the same call unchanged.',
  };
}

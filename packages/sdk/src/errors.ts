// One field-level problem, for INVALID_INPUT.
export type ErrorIssue = { path: string; message: string };

// The error envelope every hop keeps: worker, supervisor, runtime, browser.
export type ErrorBody = {
  code: string;
  message: string;
  issues?: ErrorIssue[];
};

// Thrown with a code the caller can act on. Throw one from a handler to send
// your own code; the host's db errors and failed calls arrive as one.
export class ExtensionError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly issues?: ErrorIssue[],
  ) {
    super(message);
    this.name = 'ExtensionError';
  }

  toJSON(): ErrorBody {
    return {
      code: this.code,
      message: this.message,
      ...(this.issues && { issues: this.issues }),
    };
  }
}

// zod issues as the envelope carries them: dotted paths, no zod types.
export const toIssues = (
  issues: readonly { path: readonly PropertyKey[]; message: string }[],
): ErrorIssue[] =>
  issues.map((issue) => ({
    path: issue.path.map(String).join('.'),
    message: issue.message,
  }));

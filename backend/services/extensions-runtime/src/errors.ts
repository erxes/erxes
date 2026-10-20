import type { ErrorBody, ErrorIssue } from 'erxes-sdk';
import { z } from 'zod';

// A failure the caller should see as `{ ok: false, error: { code, message,
// issues? } }` with this HTTP status. The app's error handler turns any other
// throw into a 500, so a bad request never takes the process down.
export class ApiError extends Error {
  constructor(
    readonly status:
      | 400
      | 401
      | 403
      | 404
      | 409
      | 412
      | 413
      | 415
      | 422
      | 429
      | 502
      | 503
      | 504,
    readonly code: string,
    message: string,
    readonly issues?: ErrorIssue[],
  ) {
    super(message);
  }

  body(): ErrorBody {
    return {
      code: this.code,
      message: this.message,
      ...(this.issues && { issues: this.issues }),
    };
  }
}

export const invalidInput = (error: z.core.$ZodError) =>
  new ApiError(
    400,
    'INVALID_INPUT',
    z.prettifyError(error),
    error.issues.map((issue) => ({
      path: issue.path.map(String).join('.'),
      message: issue.message,
    })),
  );

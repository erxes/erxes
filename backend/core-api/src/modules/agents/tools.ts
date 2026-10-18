import type { AgentsApprovalMode } from './@types/settings';

export interface IAgentsToolContext {
  subdomain: string;
  userId: string;
}

export const readApprovalMode = (
  context:
    | {
        requestContext?:
          | { get?(key: string): unknown }
          | Record<string, unknown>;
      }
    | undefined,
): AgentsApprovalMode => {
  const rc = context?.requestContext as
    | ({ get?(key: string): unknown } & Record<string, unknown>)
    | undefined;

  const value =
    typeof rc?.get === 'function' ? rc.get('approvalMode') : rc?.approvalMode;

  // Missing (pre-feature snapshots) or unknown → fail safe into 'writes'.
  return value === 'writes' || value === 'destructive' ? value : 'writes';
};

export const readIdentity = (context: {
  requestContext?: { get(key: string): unknown };
}): { subdomain: string; userId: string } => {
  const subdomain = context.requestContext?.get('subdomain');
  const userId = context.requestContext?.get('userId');

  if (typeof subdomain !== 'string' || typeof userId !== 'string') {
    throw new Error('Agents tool request context is incomplete.');
  }

  return { subdomain, userId };
};

/** Render a platform error (403 denial, 413 too-large, etc.) as tool output. */
export const toToolFailure = (error: unknown): Record<string, unknown> => {
  if (error instanceof Error) {
    const err = error as Error & {
      code?: string;
      statusCode?: number;
      suggestion?: string;
    };

    return {
      status: 'error',
      error: err.message || 'Tool call failed.',
      code: err.code ?? 'SERVER_ERROR',
      ...(typeof err.statusCode === 'number'
        ? { httpStatus: err.statusCode }
        : {}),
      ...(err.suggestion ? { suggestion: err.suggestion } : {}),
    };
  }

  return { status: 'error', error: 'Tool call failed.' };
};

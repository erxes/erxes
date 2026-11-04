import { createHash, randomUUID } from 'node:crypto';
import {
  assertGraphqlResultAllowed,
  parseGraphqlOperation,
} from 'erxes-api-shared/utils';
import { getOperationAST } from 'graphql';
import { z } from 'zod';
import { ApiError } from './errors';
import { LIMITS } from './limits';
import type { Grant } from './sandbox';

const GATEWAY_URL =
  process.env.EXT_GATEWAY_URL || 'http://localhost:4000/graphql';

// The extension's GraphQL operations, by `sha256:<hex>` of their text: the
// `persisted-documents.json` its codegen writes. A run can send only these.
export type Operations = Record<string, string>;

export type OperationKind = 'read' | 'write' | 'destructive';

// The deny checks the core agent runs too, from erxes-api-shared: no
// subscriptions, no
// sign-in, account, permission, API app or credential fields, in the document,
// its variables or its result. Everything else runs as the user, through the
// resolvers' own permission checks.
const CALLER = 'extension';
// Mutations the install dialog marks destructive.
const DESTRUCTIVE = /(remove|delete|merge|destroy)/i;

// A refusal from the shared checks, as the extension receives it.
const allowed = <T>(check: () => T): T => {
  try {
    return check();
  } catch (e) {
    throw new ApiError(
      403,
      'OPERATION_NOT_ALLOWED',
      e instanceof Error ? e.message : String(e),
    );
  }
};

export type OperationSummary = {
  hash: string;
  name: string;
  kind: OperationKind;
  fields: string[];
};

// What install checks before it stores the operations, and what the owner
// reads in the install dialog: one named query or mutation per document, its
// hash matching its text, passing the shared deny checks. The gateway
// validates the document against the schema on every call.
export const summarizeOperation = (
  hash: string,
  document: string,
): OperationSummary => {
  if (
    `sha256:${createHash('sha256').update(document).digest('hex')}` !== hash
  ) {
    throw new Error(`operation ${hash} doesn't match its text`);
  }

  const parsed = parseGraphqlOperation(document, { caller: CALLER });
  const name = getOperationAST(parsed.document)?.name?.value;

  if (!name) {
    throw new Error(`operation ${hash} must be a named operation`);
  }

  return {
    hash,
    name,
    kind:
      parsed.operation === 'query'
        ? 'read'
        : parsed.rootFields.some((f) => DESTRUCTIVE.test(f))
        ? 'destructive'
        : 'write',
    fields: parsed.rootFields,
  };
};

export const HostGraphqlRequest = z.object({
  grant: z.string(),
  hash: z.string(),
  variables: z.record(z.string(), z.unknown()).default({}),
});

export type HostGraphqlRequest = z.infer<typeof HostGraphqlRequest>;

// Messages the gateway and plugin resolvers raise for a caller they refuse.
const UNAUTHENTICATED = ['Login required'];
const FORBIDDEN = [
  'Permission required',
  'Permission denied',
  'You do not have permission to view.',
];

// A failure nobody mapped. Its details stay in the runtime's log; the
// extension gets the correlation id to find them.
const upstreamFailure = (name: string, detail: unknown) => {
  const correlationId = randomUUID();
  console.error(`[${correlationId}] ${name}`, detail);
  return new ApiError(
    502,
    'UPSTREAM',
    `erxes couldn't complete ${name} (${correlationId})`,
  );
};

// What runs the operation: the gateway, as the caller.
export type Upstream = (call: {
  name: string;
  document: string;
  variables: Record<string, unknown>;
}) => Promise<unknown>;

// Only an operation the install shipped. The extension sends its hash, never
// a document, so the install dialog showed everything a run can do. The deny
// checks run again on every call: on the document and its variables before
// the gateway sees them, and on the result before the extension does.
export const runOperation = async (
  operations: Operations,
  { hash, variables }: Pick<HostGraphqlRequest, 'hash' | 'variables'>,
  upstream: Upstream,
) => {
  const document = operations[hash];

  if (document === undefined) {
    throw new ApiError(
      403,
      'NOT_GRANTED',
      `operation ${hash} isn't in this install's persisted documents. Run codegen and build again.`,
    );
  }

  const parsed = allowed(() =>
    parseGraphqlOperation(document, { caller: CALLER, variables }),
  );
  const data = await upstream({
    name: getOperationAST(parsed.document)?.name?.value ?? 'operation',
    document,
    variables,
  });

  allowed(() => assertGraphqlResultAllowed(parsed.document, data, CALLER));

  return data;
};

const GatewayBody = z.object({
  data: z.record(z.string(), z.unknown()).nullish(),
  errors: z.array(z.object({ message: z.string() })).optional(),
});

// The caller's own session and hostname, so the gateway resolves the same
// tenant and user and the resolvers run their own permission checks. Ends by
// `deadline`, and stops when the grant is revoked, so no upstream call
// outlives the run that made it.
export const gatewayUpstream =
  ({ session, deadline, abort }: Grant): Upstream =>
  async ({ name, document, variables }) => {
    const timeoutMs = Math.min(LIMITS.upstreamTimeoutMs, deadline - Date.now());
    let res: Response;

    try {
      res = await fetch(GATEWAY_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...session.credential,
          // getSubdomain reads this first, in the gateway and every subgraph.
          'nginx-hostname': session.hostname,
        },
        body: JSON.stringify({ query: document, variables }),
        signal: AbortSignal.any([
          abort.signal,
          AbortSignal.timeout(Math.max(timeoutMs, 0)),
        ]),
      });
    } catch (e) {
      if (abort.signal.aborted) {
        throw new ApiError(
          403,
          'GRANT_EXPIRED',
          `The call ended before erxes answered ${name}`,
        );
      }

      if (e instanceof DOMException && e.name === 'TimeoutError') {
        throw new ApiError(
          502,
          'UPSTREAM',
          `erxes didn't answer ${name} within ${timeoutMs}ms`,
        );
      }

      throw upstreamFailure(name, e);
    }

    const body = GatewayBody.safeParse(await res.json().catch(() => null));

    if (!body.success) {
      throw upstreamFailure(
        name,
        `gateway answered ${res.status} without a GraphQL result`,
      );
    }

    const message = body.data.errors?.[0]?.message;

    if (message === undefined) {
      return body.data.data ?? {};
    }

    if (UNAUTHENTICATED.includes(message)) {
      throw new ApiError(401, 'UNAUTHENTICATED', message);
    }

    if (FORBIDDEN.includes(message)) {
      throw new ApiError(403, 'FORBIDDEN', message);
    }

    // A resolver's own error, the same message the erxes UI would show.
    throw new ApiError(422, 'GRAPHQL', message);
  };

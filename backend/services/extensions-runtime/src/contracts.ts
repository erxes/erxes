import { randomUUID } from 'node:crypto';
import { type ContractEntry, findContract, toDocument } from 'erxes-sdk';
import { z } from 'zod';
import { ApiError, invalidInput } from './errors';
import { LIMITS } from './limits';
import type { Grant } from './sandbox';

const GATEWAY_URL =
  process.env.EXT_GATEWAY_URL || 'http://localhost:4000/graphql';

export const HostCallRequest = z.object({
  grant: z.string(),
  host: z.string(),
  name: z.string(),
  input: z.unknown(),
});

export type HostCallRequest = z.infer<typeof HostCallRequest>;

// Messages the gateway and plugin resolvers raise for a caller they refuse.
// Only these, and an entry's notFound, reach the extension verbatim.
const UNAUTHENTICATED = ['Login required'];
const FORBIDDEN = [
  'Permission required',
  'Permission denied',
  'You do not have permission to view.',
];

export type Pins = Record<string, number>;

// An upstream failure nobody mapped. Its details stay in the runtime's log;
// the extension and run history get the correlation id to find them.
const upstreamFailure = (host: string, name: string, detail: unknown) => {
  const correlationId = randomUUID();
  console.error(`[${correlationId}] ${host}.${name}`, detail);
  return new ApiError(
    502,
    'UPSTREAM',
    `erxes couldn't complete ${host}.${name} (${correlationId})`,
  );
};

// The entry, if the install pinned its host and the pinned version has it.
const pinnedEntry = (uses: Pins, host: string, name: string) => {
  const version = uses[host];
  const entry =
    version === undefined
      ? undefined
      : findContract(host, version)?.entries.find((e) => e.name === name);

  if (version === undefined || !entry) {
    throw new ApiError(
      403,
      'NOT_GRANTED',
      version === undefined
        ? `This extension doesn't pin ${host}. Add it to \`uses\`.`
        : `${host}@${version} has no ${name}`,
    );
  }

  return { version, entry };
};

// What runs the entry: the gateway in the runtime, fixture mocks in try.ts.
export type Upstream = (call: {
  host: string;
  version: number;
  entry: ContractEntry;
  input: unknown;
}) => Promise<unknown>;

// Pinned entry -> input parse -> upstream -> output parse. The output schema
// is a boundary: what doesn't parse is an error, never passed through.
export const runContractCall = async (
  uses: Pins,
  { host, name, input }: Pick<HostCallRequest, 'host' | 'name' | 'input'>,
  upstream: Upstream,
) => {
  const { version, entry } = pinnedEntry(uses, host, name);
  const parsedInput = await entry.input.safeParseAsync(input);

  if (!parsedInput.success) {
    throw invalidInput(parsedInput.error);
  }

  const data = await upstream({
    host,
    version,
    entry,
    input: parsedInput.data,
  });
  const output = await entry.output.safeParseAsync(data);

  if (!output.success) {
    throw upstreamFailure(
      host,
      name,
      `result doesn't match ${host}@${version}: ${z.prettifyError(
        output.error,
      )}`,
    );
  }

  return output.data;
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
  async ({ host, entry, input }) => {
    const timeoutMs = Math.min(LIMITS.upstreamTimeoutMs, deadline - Date.now());
    let res: Response;

    try {
      res = await fetch(GATEWAY_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${session.token}`,
          // getSubdomain reads this first, in the gateway and every subgraph.
          'nginx-hostname': session.hostname,
        },
        body: JSON.stringify({
          query: toDocument(host, entry),
          variables: input,
        }),
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
          `The call ended before ${host} answered ${entry.name}`,
        );
      }

      if (e instanceof DOMException && e.name === 'TimeoutError') {
        throw new ApiError(
          502,
          'UPSTREAM',
          `${host} didn't answer ${entry.name} within ${timeoutMs}ms`,
        );
      }

      throw upstreamFailure(host, entry.name, e);
    }

    const body = GatewayBody.safeParse(await res.json().catch(() => null));

    if (!body.success) {
      throw upstreamFailure(
        host,
        entry.name,
        `gateway answered ${res.status} without a GraphQL result`,
      );
    }

    const message = body.data.errors?.[0]?.message;

    if (message === undefined) {
      return body.data.data?.[entry.field];
    }

    if (message === entry.notFound) {
      return null;
    }

    if (UNAUTHENTICATED.includes(message)) {
      throw new ApiError(401, 'UNAUTHENTICATED', message);
    }

    if (FORBIDDEN.includes(message)) {
      throw new ApiError(403, 'FORBIDDEN', message);
    }

    throw upstreamFailure(host, entry.name, message);
  };

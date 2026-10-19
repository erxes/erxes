import { randomUUID } from 'node:crypto';
import {
  type Contract,
  type ContractEntry,
  type Contracts,
  findContract,
} from 'erxes-sdk';
import { z } from 'zod';
import { ApiError, invalidInput } from './errors';
import { LIMITS } from './limits';

const GATEWAY_URL =
  process.env.EXT_GATEWAY_URL || 'http://localhost:4000/graphql';

export const HostCallRequest = z.object({
  grant: z.string(),
  host: z.string(),
  name: z.string(),
  input: z.unknown(),
});

export type HostCallRequest = z.infer<typeof HostCallRequest>;

// One contract entry as a GraphQL call through the gateway. `field` is the
// root field the document selects; `notFound` is the resolver's error for a
// missing record, which the contract answers with null.
type Document = { query: string; field: string; notFound?: string };

type EntryName<C extends Contract> = C['entries'][number]['name'];

// Hand-written, one per entry, read-only fields of the sales SDL as it is.
// Missing a document for an entry is a type error.
const documents: {
  [H in keyof Contracts]: {
    [V in keyof Contracts[H]]: Contracts[H][V] extends Contract
      ? Record<EntryName<Contracts[H][V]>, Document>
      : never;
  };
} = {
  sales: {
    1: {
      // No clientPortalCard: with it, dealDetail skips the caller's checks.
      'deals.get': {
        query: `query extSalesDealsGet($_id: String!) {
          dealDetail(_id: $_id) {
            _id name stageId priority description assignedUserIds
          }
        }`,
        field: 'dealDetail',
        notFound: 'Deal not found',
      },
      'stages.get': {
        query: `query extSalesStagesGet($_id: String!) {
          salesStageDetail(_id: $_id) { _id name order pipelineId }
        }`,
        field: 'salesStageDetail',
      },
    },
  },
};

const served: Record<
  string,
  Record<number, Record<string, Document>> | undefined
> = documents;

// Messages the gateway and plugin resolvers raise for a caller they refuse.
// Only these, and a document's notFound, reach the extension verbatim.
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
// `deadline`, so no upstream call outlives the run that made it.
export const gatewayUpstream =
  (session: { token: string; hostname: string }, deadline: number): Upstream =>
  async ({ host, version, entry, input }) => {
    const document = served[host]?.[version]?.[entry.name];

    if (!document) {
      throw upstreamFailure(
        host,
        entry.name,
        `no document for ${host}@${version}`,
      );
    }

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
        body: JSON.stringify({ query: document.query, variables: input }),
        signal: AbortSignal.timeout(Math.max(timeoutMs, 0)),
      });
    } catch (e) {
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
      return body.data.data?.[document.field];
    }

    if (message === document.notFound) {
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

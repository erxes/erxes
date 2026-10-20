import { issueAgentReferences } from './references';
import { extractGraphqlReferences } from './graphqlReferences';
import { z } from 'zod';
import type { Tool } from '@mastra/core/tools' with {
  'resolution-mode': 'import',
};
import { makeExecutableSchema } from '@graphql-tools/schema';
import {
  getNamedType,
  isEnumType,
  isInputObjectType,
  isInterfaceType,
  isObjectType,
  isUnionType,
  parse,
  printType,
  type GraphQLField,
  type GraphQLNamedType,
  type GraphQLSchema,
} from 'graphql';
import {
  agentToolResponseTooLargeError,
  agentToolsAuthHeaderName,
  encodeAgentToolsAuthHeader,
  getAgentToolMaxResponseBytes,
  getPluginAddress,
  getPlugins,
  oversizedAgentToolResultBytes,
} from 'erxes-api-shared/utils';
import { gatewayUrl } from '~/utils/email/links';
import {
  AGENT_GRAPHQL_DENIED_FIELD,
  assertAgentGraphqlResultAllowed,
  parseAgentGraphqlOperation,
  requiresGraphqlApproval,
} from './graphqlPolicy';
import {
  readApprovalMode,
  readIdentity,
  toToolFailure,
} from './tools';

/**
 * GraphQL access for the agents module.
 *
 * `searchGraphql` lets the model discover workspace queries/mutations when
 * the user requests workspace data or an action; `callGraphql` executes ONE operation through the
 * gateway's public `/graphql` — the same path the UI uses — authenticated
 * with the HMAC agent-auth header so the gateway loads the acting user's
 * document and every resolver's own permission checks apply unchanged.
 *
 * The search catalog is built by introspecting each registered service's
 * federation `_service.sdl` (the same document the gateway's proxy health
 * check uses) and merging them into one resolvers-less schema.
 */

type MastraTool = Tool;

const SCHEMA_CACHE_TTL_MS = 60_000;
const SUBGRAPH_SDL_TIMEOUT_MS = 10_000;
const GRAPHQL_CALL_TIMEOUT_MS = 60_000;
/** Total printed-type SDL a searchGraphql result may carry. */
const TYPES_BUDGET_BYTES = 12 * 1024;

const SUBGRAPH_SDL_QUERY = `query SubgraphIntrospectQuery {
  _service {
    sdl
  }
}`;

const SUBGRAPH_SDL_OPERATION_NAME = 'SubgraphIntrospectQuery';

const ROOT_OPERATION_TYPES = new Set(['Query', 'Mutation', 'Subscription']);

/** The merged workspace schema, or null when no service answered. */
let schemaCache: {
  schema: GraphQLSchema | null;
  fetchedAt: number;
  owners: Map<string, string>;
} | null = null;

const fetchSubgraphSdl = async (plugin: string): Promise<string | null> => {
  try {
    const address = await getPluginAddress(plugin);

    if (!address) {
      return null;
    }

    const response = await fetch(`${address}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: SUBGRAPH_SDL_QUERY,
        operationName: SUBGRAPH_SDL_OPERATION_NAME,
      }),
      signal: AbortSignal.timeout(SUBGRAPH_SDL_TIMEOUT_MS),
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      data?: { _service?: { sdl?: unknown } };
    };

    const sdl = payload?.data?._service?.sdl;

    return typeof sdl === 'string' && sdl ? sdl : null;
  } catch {
    return null;
  }
};

/**
 * `extend type Query` is legal subgraph SDL but `makeExecutableSchema`
 * rejects an extension without a base definition, so a stub base is added
 * for every extended root type no service defined. The stub field is
 * filtered out of search results.
 */
const STUB_ROOT_FIELD = '_agentSchemaStub';

const stubRootTypeDefs = (sdls: string[]): string[] => {
  const defined = new Set<string>();
  const extended = new Set<string>();

  for (const sdl of sdls) {
    try {
      for (const definition of parse(sdl).definitions) {
        if (definition.kind === 'ObjectTypeDefinition') {
          if (ROOT_OPERATION_TYPES.has(definition.name.value)) {
            defined.add(definition.name.value);
          }
        } else if (definition.kind === 'ObjectTypeExtension') {
          if (ROOT_OPERATION_TYPES.has(definition.name.value)) {
            extended.add(definition.name.value);
          }
        }
      }
    } catch {
      // Unparseable SDL is tolerated like an unreachable service.
    }
  }

  return [...extended]
    .filter((name) => !defined.has(name))
    .map((name) => `type ${name} { ${STUB_ROOT_FIELD}: Boolean }`);
};

export const loadMergedSchema = async (): Promise<GraphQLSchema | null> => {
  const now = Date.now();

  if (schemaCache && now - schemaCache.fetchedAt < SCHEMA_CACHE_TTL_MS) {
    return schemaCache.schema;
  }

  const plugins = await getPlugins();
  const sources = await Promise.all(
    plugins.map(async (plugin) => ({ plugin, sdl: await fetchSubgraphSdl(plugin) })),
  );
  const sdls: string[] = [];
  const owners = new Map<string, string>();

  for (const { plugin, sdl } of sources) {
    if (!sdl) continue;
    sdls.push(sdl);
    try {
      for (const definition of parse(sdl).definitions) {
        if (
          (definition.kind === 'ObjectTypeDefinition' ||
            definition.kind === 'ObjectTypeExtension') &&
          (definition.name.value === 'Query' ||
            definition.name.value === 'Mutation')
        ) {
          const operation = definition.name.value.toLowerCase();
          for (const field of definition.fields ?? []) {
            const key = `${operation}.${field.name.value}`;
            if (!owners.has(key)) owners.set(key, plugin);
          }
        }
      }
    } catch {
      // Schema construction below handles malformed SDL.
    }
  }

  let schema: GraphQLSchema | null = null;

  if (sdls.length) {
    try {
      schema = makeExecutableSchema({
        typeDefs: [...sdls, ...stubRootTypeDefs(sdls)],
        // No resolvers are attached — the schema is a search catalog only —
        // so federation directives and declaration merging must not throw.
        assumeValidSDL: true,
        assumeValid: true,
      });
    } catch {
      schema = null;
    }
  }

  schemaCache = { schema, fetchedAt: now, owners };

  return schema;
};

interface IRootFieldEntry {
  operation: 'query' | 'mutation';
  name: string;
  field: GraphQLField<unknown, unknown>;
}

const collectRootFields = (schema: GraphQLSchema): IRootFieldEntry[] => {
  const entries: IRootFieldEntry[] = [];

  for (const [operation, rootType] of [
    ['query', schema.getQueryType()],
    ['mutation', schema.getMutationType()],
  ] as const) {
    if (!rootType) {
      continue;
    }

    for (const [name, field] of Object.entries(rootType.getFields())) {
      if (name === STUB_ROOT_FIELD || AGENT_GRAPHQL_DENIED_FIELD.test(name)) {
        continue;
      }

      entries.push({ operation, name, field });
    }
  }

  return entries;
};

/** Term-overlap ranking on field name, description, and argument names. */
const rankFieldsByIntent = (
  entries: IRootFieldEntry[],
  intent: string,
): IRootFieldEntry[] => {
  const terms = intent.toLowerCase().split(/\s+/).filter(Boolean);

  const scored = entries.map((entry) => {
    const haystack =
      `${entry.name} ${entry.field.description ?? ''} ${entry.field.args
        .map((arg) => arg.name)
        .join(' ')}`.toLowerCase();
    let score = 0;

    for (const term of terms) {
      if (haystack.includes(term)) {
        score += 1;
      }
    }

    return { entry, score };
  });

  return scored
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((candidate) => candidate.entry);
};

const fieldSignature = (field: GraphQLField<unknown, unknown>): string => {
  const args = field.args
    .map((arg) => `${arg.name}: ${String(arg.type)}`)
    .join(', ');

  return `${field.name}(${args}): ${String(field.type)}`;
};

/**
 * Input objects and enums reachable from the field's arguments, transitively.
 * Only inputs/enums carry information a scalar cannot express; object types
 * are never valid input anyway.
 */
const collectArgumentTypes = (
  field: GraphQLField<unknown, unknown>,
): GraphQLNamedType[] => {
  const seen = new Set<string>();
  const collected: GraphQLNamedType[] = [];

  const visit = (named: GraphQLNamedType): void => {
    if (seen.has(named.name)) {
      return;
    }

    seen.add(named.name);

    if (isEnumType(named)) {
      collected.push(named);
      return;
    }

    if (isInputObjectType(named)) {
      collected.push(named);

      for (const inputField of Object.values(named.getFields())) {
        visit(getNamedType(inputField.type));
      }
    }
  };

  for (const arg of field.args) {
    visit(getNamedType(arg.type));
  }

  return collected;
};

/**
 * Printed SDL for the types a caller needs to write this field's arguments
 * and read its result: every reachable input type/enum in full, plus the
 * return named type — composite types print their fields but reference
 * nested objects by name only. `printed` dedupes types already emitted for
 * earlier results so shared inputs are not repeated.
 */
const typesSdlForField = (
  field: GraphQLField<unknown, unknown>,
  printed: Set<string>,
): string => {
  const types = collectArgumentTypes(field);
  const returnType = getNamedType(field.type);

  if (
    isObjectType(returnType) ||
    isInterfaceType(returnType) ||
    isUnionType(returnType) ||
    isEnumType(returnType)
  ) {
    types.push(returnType);
  }

  return types
    .filter((type) => !printed.has(type.name))
    .map((type) => {
      printed.add(type.name);
      return printType(type);
    })
    .join('\n\n');
};

interface IGraphqlErrorEntry {
  message: string;
  path?: (string | number)[];
  code?: string;
}

const sanitizeGraphqlErrors = (errors: unknown): IGraphqlErrorEntry[] => {
  if (!Array.isArray(errors)) {
    return [];
  }

  return errors.map((entry) => {
    const typed = (entry ?? {}) as {
      message?: unknown;
      path?: unknown;
      extensions?: { code?: unknown };
    };

    return {
      message:
        typeof typed.message === 'string' ? typed.message : 'GraphQL error.',
      ...(Array.isArray(typed.path)
        ? {
            path: typed.path.filter(
              (segment): segment is string | number =>
                typeof segment === 'string' || typeof segment === 'number',
            ),
          }
        : {}),
      ...(typeof typed.extensions?.code === 'string'
        ? { code: typed.extensions.code }
        : {}),
    };
  });
};

// @mastra/core/tools is ESM-only under nodenext; load it dynamically (like the
// other Mastra entries) and build the two tools once per process.
export const listGraphqlCapabilities = async () => {
  const schema = await loadMergedSchema();
  return schema ? collectRootFields(schema).map((entry) => ({
    id: `graphql.${entry.operation}.${entry.name}`,
    plugin: schemaCache?.owners.get(`${entry.operation}.${entry.name}`) ?? 'graphql',
    module: entry.operation,
    path: entry.name,
    method: entry.operation,
    description: entry.field.description ?? fieldSignature(entry.field),
    inputFields: entry.field.args.map((arg) => ({
      name: arg.name, type: String(arg.type), required: String(arg.type).endsWith('!'),
    })),
  })) : [];
};

let graphqlToolsPromise:
  | Promise<{ searchGraphql: MastraTool; callGraphql: MastraTool }>
  | null = null;

export const buildGraphqlTools = async (): Promise<{
  searchGraphql: MastraTool;
  callGraphql: MastraTool;
}> => {
  if (!graphqlToolsPromise) {
    graphqlToolsPromise = import('@mastra/core/tools').then(({ createTool }) => ({
      searchGraphql: createTool({
        id: 'searchGraphql',
        description:
          'Search the workspace GraphQL API — the same API the erxes UI uses — for queries and mutations relevant to the user\'s goal. Returns matching root fields with signatures and the SDL of their argument and return types. Use this to discover the operation and its fields before calling callGraphql.',
        inputSchema: z.object({
          intent: z
            .string()
            .min(1)
            .describe('What the user wants to accomplish, in a few words'),
          maxResults: z
            .number()
            .int()
            .min(1)
            .max(20)
            .optional()
            .describe('Maximum number of fields to return (default 8)'),
        }),
        execute: async ({ intent, maxResults }, context) => {
          readIdentity(context);
          const approvalMode = readApprovalMode(context);
          const schema = await loadMergedSchema();

          if (!schema) {
            return { matched: 0, fields: [] };
          }

          const entries = collectRootFields(schema);
          const matches = rankFieldsByIntent(entries, intent);
          const ranked = matches.slice(0, maxResults ?? 8);

          const printed = new Set<string>();
          let typesBudget = TYPES_BUDGET_BYTES;

          return {
            matched: matches.length,
            fields: ranked.map((entry) => {
              let types = typesSdlForField(entry.field, printed);
              const typesBytes = Buffer.byteLength(types, 'utf8');

              if (typesBytes > typesBudget) {
                types =
                  'Type SDL omitted: the response type budget was reached by earlier results — search again with a narrower intent to see these types.';
              } else {
                typesBudget -= typesBytes;
              }

              return {
                operation: entry.operation,
                field: entry.name,
                signature: fieldSignature(entry.field),
                ...(entry.field.description
                  ? { description: entry.field.description }
                  : {}),
                requiresApproval: requiresGraphqlApproval(
                  { operation: entry.operation, rootFields: [entry.name] },
                  approvalMode,
                ),
                types,
              };
            }),
          };
        },
      }),
      callGraphql: createTool({
        id: 'callGraphql',
        description:
          'Run one GraphQL query or mutation against the workspace API as the acting user, with exactly their permissions. Send a single operation, pass values through variables, and select only the fields you need. Mutations may be held for the user\'s approval. Authentication operations (login, logout, passwords, tokens) are not available.',
        inputSchema: z.object({
          query: z
            .string()
            .min(1)
            .describe('A GraphQL document with exactly one operation'),
          variables: z
            .record(z.string(), z.unknown())
            .optional()
            .describe('Variable values referenced by the operation'),
          operationName: z
            .string()
            .optional()
            .describe('The operation to run when the document defines several'),
        }),
        // Mutations may suspend for approval; parse failures return false so
        // `execute` can report the actionable error to the model.
        requireApproval: async (input, ctx) => {
          const query = input?.query;
          const operationName = input?.operationName;

          if (typeof query !== 'string') {
            return false;
          }

          try {
            return requiresGraphqlApproval(
              parseAgentGraphqlOperation(
                query,
                typeof operationName === 'string' ? operationName : undefined,
                input?.variables,
              ),
              readApprovalMode(ctx),
            );
          } catch {
            return false;
          }
        },
        execute: async ({ query, variables, operationName }, context) => {
          const { subdomain, userId } = readIdentity(context);
          const stampedThreadId = context.requestContext.get('threadId');
          const threadId =
            typeof stampedThreadId === 'string' && stampedThreadId
              ? stampedThreadId
              : undefined;

          let parsed: ReturnType<typeof parseAgentGraphqlOperation>;
          try {
            parsed = parseAgentGraphqlOperation(
              query,
              typeof operationName === 'string' ? operationName : undefined,
              variables,
            );
          } catch (error) {
            return toToolFailure(error);
          }

          let response: Response;
          let payload: { data?: unknown; errors?: unknown } | null;

          try {
            response = await fetch(`${gatewayUrl(subdomain)}/graphql`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'nginx-hostname': subdomain,
                [agentToolsAuthHeaderName]: encodeAgentToolsAuthHeader(
                  subdomain,
                  userId,
                  threadId ? { threadId } : undefined,
                ),
              },
              body: JSON.stringify({ query, variables, operationName }),
              signal: AbortSignal.timeout(GRAPHQL_CALL_TIMEOUT_MS),
            });
          } catch (error) {
            return toToolFailure(error);
          }

          try {
            payload = (await response.json()) as {
              data?: unknown;
              errors?: unknown;
            } | null;
          } catch {
            return toToolFailure(
              Object.assign(
                new Error(
                  `The gateway answered the GraphQL request with a non-JSON response (HTTP ${response.status}).`,
                ),
                { code: 'GRAPHQL_ERROR', statusCode: response.status },
              ),
            );
          }

          const errors = sanitizeGraphqlErrors(payload?.errors);
          const data = payload?.data ?? null;

          if (data !== null) {
            const maxResponseBytes = getAgentToolMaxResponseBytes();
            const dataBytes = oversizedAgentToolResultBytes(
              data,
              maxResponseBytes,
            );

            if (dataBytes !== null) {
              return toToolFailure(
                agentToolResponseTooLargeError(
                  'callGraphql',
                  dataBytes,
                  maxResponseBytes,
                ),
              );
            }

            try {
              assertAgentGraphqlResultAllowed(parsed.document, data);
            } catch (error) {
              return toToolFailure(error);
            }

            const schema = schemaCache?.schema;
            const references = schema
              ? extractGraphqlReferences(schema, parsed.document, data, operationName)
              : [];
            return {
              status: 'ok',
              data,
              ...(references.length ? issueAgentReferences(references) : {}),
              ...(errors.length ? { errors } : {}),
            };
          }

          return {
            status: 'error',
            error: errors.length
              ? errors.map((entry) => entry.message).join('; ')
              : `The GraphQL request failed (HTTP ${response.status}).`,
            code: errors[0]?.code ?? 'GRAPHQL_ERROR',
            errors,
            httpStatus: response.status,
          };
        },
      }),
    }));
  }

  return graphqlToolsPromise;
};

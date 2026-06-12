import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import {
  executeErxesOperation,
  graphqlTypeToString,
  type ErxesToolSettings,
} from './erxesTools';
import { OperationMeta, OperationRegistry } from './operationRegistry';
import { ToolPolicy, isOperationAllowed } from './scope';

// LLMs sometimes pass the args object as a JSON string. Parse it back so the
// execute tool always receives a real object.
function coerceArgs(val: unknown): Record<string, unknown> {
  if (val && typeof val === 'object' && !Array.isArray(val))
    return val as Record<string, unknown>;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return {};
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed))
        return parsed;
    } catch {
      try {
        const parsed = JSON.parse(trimmed.replace(/'/g, '"'));
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed))
          return parsed;
      } catch {
        /* fall through */
      }
    }
  }
  return {};
}

// Render an operation's args as a compact, model-readable signature.
function argSignature(op: OperationMeta) {
  return (op.graphqlArgs || []).map((arg) => ({
    name: arg.name,
    type: graphqlTypeToString(arg.type),
    required: arg.type?.kind === 'NON_NULL',
  }));
}

// Keyword relevance score for a search query. Name matches weigh most, then
// module, then description, then plugin — enough to float the right op to the
// top of a short result list without a real search index.
function scoreOperation(op: OperationMeta, tokens: string[]): number {
  const name = op.operation.toLowerCase();
  const module = (op.module || '').toLowerCase();
  const plugin = (op.plugin || '').toLowerCase();
  const desc = (op.description || '').toLowerCase();

  let score = 0;
  for (const token of tokens) {
    if (name === token) score += 40;
    if (name.includes(token)) score += 10;
    if (module.includes(token)) score += 6;
    if (desc.includes(token)) score += 3;
    if (plugin.includes(token)) score += 2;
  }
  return score;
}

/**
 * Builds the two meta-tools that replace per-operation tool binding:
 *
 *   search_erxes_operations(query)         → discover what's runnable
 *   execute_erxes_operation(operation,args)→ run one by exact name
 *
 * Both are closed over the agent's policy, so a restricted agent can neither
 * see nor run anything outside its allowlist — the search results are filtered
 * AND execute re-checks, so the boundary holds even if the model guesses a name.
 */
export function buildErxesMetaTools(params: {
  registry: OperationRegistry;
  settings: ErxesToolSettings;
  policy: ToolPolicy;
}) {
  const { registry, settings, policy } = params;

  /** Operations visible to this agent after policy filtering. */
  const allowedList = (): OperationMeta[] =>
    policy.mode === 'all'
      ? registry.list
      : registry.list.filter((op) => isOperationAllowed(op, policy));

  const search = createTool({
    id: 'search_erxes_operations',
    description:
      'Search the available erxes operations (GraphQL queries and mutations) by keyword. ' +
      'Call this FIRST to discover the exact operation name and arguments before executing. ' +
      'Example queries: "create deal", "list customers", "send email", "update task".',
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          'Keywords describing the action, e.g. "create deal" or "list customers".',
        ),
      operationType: z
        .enum(['query', 'mutation'])
        .optional()
        .describe('Optional filter: "query" for reads, "mutation" for writes.'),
      limit: z.coerce.number().int().min(1).max(50).default(12).optional(),
    }),
    outputSchema: z.any(),
    execute: ({ query, operationType, limit }) => {
      let pool = allowedList();
      if (operationType)
        pool = pool.filter((op) => op.operationType === operationType);

      const tokens = (query || '')
        .toLowerCase()
        .split(/\s+/)
        .map((token) => token.replace(/[^a-z0-9]/g, ''))
        .filter(Boolean);

      const max = limit ?? 12;
      let ranked: OperationMeta[];
      if (!tokens.length) {
        ranked = [...pool]
          .sort((a, b) => a.operation.localeCompare(b.operation))
          .slice(0, max);
      } else {
        ranked = pool
          .map((op) => ({ op, score: scoreOperation(op, tokens) }))
          .filter((r) => r.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, max)
          .map((r) => r.op);
      }

      return Promise.resolve({
        total: ranked.length,
        results: ranked.map((op) => ({
          operation: op.operation,
          type: op.operationType,
          plugin: op.plugin,
          module: op.module,
          description: op.description,
          args: argSignature(op),
        })),
        note: ranked.length
          ? 'Call execute_erxes_operation with one of these "operation" names and an "args" object built from its arguments.'
          : 'No matching operations. Try different keywords.',
      });
    },
  });

  const execute = createTool({
    id: 'execute_erxes_operation',
    description:
      'Execute a single erxes operation (query or mutation) by its exact name. ' +
      'Use the operation name and arguments returned by search_erxes_operations. ' +
      'Returns the operation result, or { success:false, … } with guidance if it fails.',
    inputSchema: z.object({
      operation: z
        .string()
        .describe(
          'Exact operation name from search_erxes_operations, e.g. "dealsAdd".',
        ),
      args: z
        .preprocess(coerceArgs, z.record(z.any()))
        .optional()
        .describe("Arguments object keyed by the operation's argument names."),
    }),
    outputSchema: z.any(),
    execute: async ({ operation, args }) => {
      const op = registry.operations.get(operation);
      if (!op) {
        return {
          success: false,
          error: `Unknown operation "${operation}". Call search_erxes_operations to find the correct name.`,
        };
      }
      if (!isOperationAllowed(op, policy)) {
        return {
          success: false,
          error: `Operation "${operation}" is not permitted for this agent.`,
        };
      }

      return await executeErxesOperation(
        op,
        coerceArgs(args),
        settings,
        registry.inputTypesMap,
        registry.objectFieldsMap,
      );
    },
  });

  return {
    search_erxes_operations: search,
    execute_erxes_operation: execute,
  };
}

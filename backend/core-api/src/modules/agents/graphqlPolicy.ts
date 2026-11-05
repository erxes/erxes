import {
  parseGraphqlOperation,
  type IGraphqlOperation,
} from 'erxes-api-shared/utils';
import type { AgentsApprovalMode } from '@/agents/@types/settings';
const HIGH_RISK_ACTION =
  /(remove|delete|merge|destroy|archive|purge|send|reply|broadcast|publish)/i;

/**
 * Operation policy for the `callGraphql` tool.
 *
 * The tool forwards one GraphQL document verbatim to the workspace gateway;
 * operation/input checks happen before any network call, and JSON response
 * checks happen before emitting a tool result. The deny checks themselves
 * live in `erxes-api-shared/utils` (`graphqlPolicy.ts`), shared with the
 * extensions runtime; this module adds the agent's approval rule.
 *
 * Pure module: no I/O, no caching, safe to unit-test directly.
 */

/**
 * Parse `document` and select exactly one executable operation, refusing
 * subscriptions, denied root fields and credential fields in the document or
 * `variables`. Throws an Error carrying `code` = 'GRAPHQL_PARSE_ERROR' or
 * 'GRAPHQL_OPERATION_NOT_ALLOWED'.
 */
export const parseAgentGraphqlOperation = (
  document: string,
  operationName?: string,
  variables?: Record<string, unknown>,
) =>
  parseGraphqlOperation(document, {
    caller: 'agent',
    operationName,
    variables,
  });

/**
 * Whether a parsed operation must be held for human approval under the
 * run's approval mode: queries never suspend; in 'writes' mode every
 * mutation does; in 'destructive' mode only mutations whose root field
 * reads as a high-risk action do.
 */
export const requiresGraphqlApproval = (
  parsed: Pick<IGraphqlOperation, 'operation' | 'rootFields'>,
  mode: AgentsApprovalMode,
): boolean => {
  if (parsed.operation === 'query') {
    return false;
  }

  if (mode === 'writes') {
    return true;
  }

  return parsed.rootFields.some((field) => HIGH_RISK_ACTION.test(field));
};

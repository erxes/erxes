import {
  parse,
  type DocumentNode,
  type FragmentDefinitionNode,
  type OperationDefinitionNode,
  type SelectionSetNode,
} from 'graphql';
import type { AgentsApprovalMode } from '@/agents/@types/settings';
const HIGH_RISK_ACTION =
  /(remove|delete|merge|destroy|archive|purge|send|reply|broadcast|publish)/i;

/**
 * Parse-time policy for the `callGraphql` tool.
 *
 * The tool forwards one GraphQL document verbatim to the workspace gateway;
 * everything enforced here happens before any network call. Subscriptions
 * and authentication/credential fields are refused outright — the agent may
 * run exactly what the acting user may run, never the operations that
 * mint or rotate credentials.
 *
 * Pure module: no I/O, no caching, safe to unit-test directly.
 */

export interface IAgentGraphqlOperation {
  operation: 'query' | 'mutation';
  /** Root field names (never aliases) selected by the operation. */
  rootFields: string[];
  document: DocumentNode;
}

/** Deny system operations, without a business-operation admission list. */
export const AGENT_GRAPHQL_DENIED_FIELD = {
  test(field: string): boolean {
    const words = field
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
      .replace(/_/g, ' ')
      .toLowerCase();
    return (
      /\b(login|logout|password|passwords|otp|tokens?|credentials?|secrets?|oauth|sso|sessions?|invitations?|permissions?)\b/.test(words) ||
      /\b(sign up|sign in|magic link|two factor|2fa|api key)\b/.test(words) ||
      /^(apps?(Add|Edit|Revoke|Remove|Detail|List|TotalCount)?|users(CreateOwner|Edit|EditProfile|SetActiveStatus|SetActiveStatusBatch|Invite)|inviteUser|agentsConnections|agentsConnectionUpsert|agentsConnectionRemove|agentsSettingsUpdate|__schema|__type|_service|_entities)$/i.test(field)
    );
  },
};

const policyError = (code: string, message: string): Error =>
  Object.assign(new Error(message), { code });

const collectRootFields = (
  selectionSet: SelectionSetNode,
  fragments: Map<string, FragmentDefinitionNode>,
  seenFragments: Set<string>,
  fields: Set<string>,
): void => {
  for (const selection of selectionSet.selections) {
    if (selection.kind === 'Field') {
      if (selection.name.value !== '__typename') {
        fields.add(selection.name.value);
      }
    } else if (selection.kind === 'InlineFragment') {
      collectRootFields(
        selection.selectionSet,
        fragments,
        seenFragments,
        fields,
      );
    } else {
      const fragment = fragments.get(selection.name.value);

      // Unvalidated documents could carry a fragment cycle; walk each once.
      if (fragment && !seenFragments.has(fragment.name.value)) {
        seenFragments.add(fragment.name.value);
        collectRootFields(
          fragment.selectionSet,
          fragments,
          seenFragments,
          fields,
        );
      }
    }
  }
};

/**
 * Parse `document` and select exactly one executable operation. Throws an
 * Error carrying `code` = 'GRAPHQL_PARSE_ERROR' when the document does not
 * parse, or 'GRAPHQL_OPERATION_NOT_ALLOWED' when no single query/mutation
 * can be selected or a denied root field is requested.
 */
export const parseAgentGraphqlOperation = (
  document: string,
  operationName?: string,
): IAgentGraphqlOperation => {
  let documentNode: DocumentNode;

  try {
    documentNode = parse(document);
  } catch (error) {
    throw policyError(
      'GRAPHQL_PARSE_ERROR',
      error instanceof Error
        ? error.message
        : 'The GraphQL document could not be parsed.',
    );
  }

  const operations = documentNode.definitions.filter(
    (definition): definition is OperationDefinitionNode =>
      definition.kind === 'OperationDefinition',
  );

  let selected: OperationDefinitionNode | undefined;

  if (operationName) {
    selected = operations.find(
      (operation) => operation.name?.value === operationName,
    );
  } else if (operations.length === 1) {
    selected = operations[0];
  }

  if (!selected || operations.length !== 1) {
    throw policyError(
      'GRAPHQL_OPERATION_NOT_ALLOWED',
      operationName
        ? `No operation named "${operationName}" exists in the document; send exactly one operation per call.`
        : 'Send exactly one GraphQL operation per call and name it when the document contains several.',
    );
  }

  if (selected.operation === 'subscription') {
    throw policyError(
      'GRAPHQL_OPERATION_NOT_ALLOWED',
      'GraphQL subscriptions are not available to the agent.',
    );
  }

  const fragments = new Map<string, FragmentDefinitionNode>();

  for (const definition of documentNode.definitions) {
    if (definition.kind === 'FragmentDefinition') {
      fragments.set(definition.name.value, definition);
    }
  }

  const rootFields = new Set<string>();
  collectRootFields(
    selected.selectionSet,
    fragments,
    new Set<string>(),
    rootFields,
  );

  for (const field of rootFields) {
    if (AGENT_GRAPHQL_DENIED_FIELD.test(field)) {
      throw policyError(
        'GRAPHQL_OPERATION_NOT_ALLOWED',
        `The root field "${field}" is denied: authentication operations are not available to the agent.`,
      );
    }
  }

  return {
    operation: selected.operation === 'mutation' ? 'mutation' : 'query',
    rootFields: [...rootFields],
    document: documentNode,
  };
};

/**
 * Whether a parsed operation must be held for human approval under the
 * run's approval mode: queries never suspend; in 'writes' mode every
 * mutation does; in 'destructive' mode only mutations whose root field
 * reads as a high-risk action do.
 */
export const requiresGraphqlApproval = (
  parsed: Pick<IAgentGraphqlOperation, 'operation' | 'rootFields'>,
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

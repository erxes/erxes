import {
  parse,
  visit,
  type DocumentNode,
  type FragmentDefinitionNode,
  type OperationDefinitionNode,
  type SelectionSetNode,
} from 'graphql';

/**
 * Credential and operation deny checks for GraphQL documents that run as a
 * signed-in user on someone else's behalf: the core agent's `callGraphql`
 * tool and extensions' persisted operations.
 *
 * Subscriptions and authentication/credential fields are refused outright:
 * the caller may run exactly what the acting user may run, never the
 * operations that mint or rotate credentials. `caller` only names who is
 * refused in the error messages ("the agent", "the extension").
 *
 * Pure module: no I/O, no caching, safe to unit-test directly.
 */

export interface IGraphqlOperation {
  operation: 'query' | 'mutation';
  /** Root field names (never aliases) selected by the operation. */
  rootFields: string[];
  document: DocumentNode;
}

const toWords = (name: string) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .toLowerCase();

/** Account/security and federation entry points, without blocking schema introspection. */
export const isDeniedGraphqlField = (field: string): boolean => {
  const words = toWords(field);
  return (
    /\b(login|logout|password|passwords|otp|tokens?|credentials?|secrets?|oauth|sso|ldap|sessions?|invitations?|permissions?)\b/.test(
      words,
    ) ||
    /\b(sign up|sign in|magic link|two factor|2fa|api key|support access)\b/.test(
      words,
    ) ||
    /^(apps?(Add|Edit|Revoke|Remove|Detail|List|TotalCount)?|users(CreateOwner|Edit|EditProfile|SetActiveStatus|SetActiveStatusBatch|Invite)|inviteUser|agentsConnections|agentsConnectionUpsert|agentsConnectionRemove|agentsConnectionSetDefault|agentsModelVerify|agentsSettingsUpdate|_service|_entities)$/i.test(
      field,
    )
  );
};

const policyError = (code: string, message: string): Error =>
  Object.assign(new Error(message), { code });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const isCredentialField = (name: string): boolean => {
  const words = toWords(name);

  return (
    /\b(auth|authentication|authorization|passwords?|tokens?|credentials?|secrets?|oauth|sso|otp)\b/.test(
      words,
    ) ||
    /\b(api|private|public|consumer|access|signing|encryption|service account) key\b/.test(
      words,
    )
  );
};

const assertCredentialFieldAllowed = (name: string, caller: string): void => {
  if (isCredentialField(name)) {
    throw policyError(
      'GRAPHQL_OPERATION_NOT_ALLOWED',
      `The field "${name}" is restricted by the ${caller} credential policy.`,
    );
  }
};

/** JSON input objects can carry credentials even when their root is a business operation. */
const assertCredentialInputAllowed = (value: unknown, caller: string): void => {
  if (Array.isArray(value)) {
    value.forEach((entry) => assertCredentialInputAllowed(entry, caller));
  } else if (isRecord(value)) {
    for (const [name, child] of Object.entries(value)) {
      assertCredentialFieldAllowed(name, caller);
      assertCredentialInputAllowed(child, caller);
    }
  }
};

/** JSON-valued configuration fields have no selectable child fields in the AST. */
export const assertGraphqlResultAllowed = (
  document: DocumentNode,
  data: unknown,
  caller: string,
): void => {
  const fragments = new Map<string, FragmentDefinitionNode>();
  for (const definition of document.definitions) {
    if (definition.kind === 'FragmentDefinition') {
      fragments.set(definition.name.value, definition);
    }
  }
  const inspect = (
    selectionSet: SelectionSetNode,
    value: unknown,
    seen: Set<string>,
  ): void => {
    if (Array.isArray(value)) {
      value.forEach((entry) => inspect(selectionSet, entry, seen));
      return;
    }
    if (!isRecord(value)) return;
    for (const selection of selectionSet.selections) {
      if (selection.kind === 'Field') {
        const child: unknown =
          value[selection.alias?.value ?? selection.name.value];
        if (selection.selectionSet)
          inspect(selection.selectionSet, child, seen);
        else assertCredentialInputAllowed(child, caller);
      } else if (selection.kind === 'InlineFragment') {
        inspect(selection.selectionSet, value, seen);
      } else if (!seen.has(selection.name.value)) {
        const fragment = fragments.get(selection.name.value);
        if (fragment)
          inspect(
            fragment.selectionSet,
            value,
            new Set([...seen, selection.name.value]),
          );
      }
    }
  };
  for (const definition of document.definitions) {
    if (definition.kind === 'OperationDefinition')
      inspect(definition.selectionSet, data, new Set());
  }
};

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
 * can be selected, a denied root field is requested, or the document or
 * `variables` name a credential field.
 */
export const parseGraphqlOperation = (
  document: string,
  {
    caller,
    operationName,
    variables,
  }: {
    caller: string;
    operationName?: string;
    variables?: Record<string, unknown>;
  },
): IGraphqlOperation => {
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
      `GraphQL subscriptions are not available to the ${caller}.`,
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
    if (isDeniedGraphqlField(field)) {
      throw policyError(
        'GRAPHQL_OPERATION_NOT_ALLOWED',
        `The root field "${field}" is denied: this operation is restricted by the ${caller} security policy.`,
      );
    }
  }

  // Inspect canonical AST names, never response aliases. GraphQL's visitor
  // covers nested selections, fragments, literal inputs and variable defaults.
  // Variable identifiers are arbitrary; only their input-object keys matter.
  visit(documentNode, {
    Field: (node) => assertCredentialFieldAllowed(node.name.value, caller),
    Argument: (node) => assertCredentialFieldAllowed(node.name.value, caller),
    ObjectField: (node) =>
      assertCredentialFieldAllowed(node.name.value, caller),
    VariableDefinition: (node) =>
      assertCredentialInputAllowed(
        variables?.[node.variable.name.value],
        caller,
      ),
  });

  return {
    operation: selected.operation === 'mutation' ? 'mutation' : 'query',
    rootFields: [...rootFields],
    document: documentNode,
  };
};

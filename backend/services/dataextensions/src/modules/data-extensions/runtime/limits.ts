import {
  ASTVisitor,
  FragmentDefinitionNode,
  GraphQLError,
  Kind,
  SelectionSetNode,
  ValidationContext,
  ValidationRule,
} from 'graphql';

const readNumber = (name: string, fallback: number) => {
  const value = Number(process.env[name]);

  return Number.isInteger(value) && value > 0 ? value : fallback;
};

export const LIMITS = {
  // Long text fields allow 20,000 characters; escaped JSON can take six
  // bytes per character, and bulk patches carry up to 100 records.
  bodyBytes: process.env.DATA_EXTENSIONS_MAX_BODY || '2mb',
  queryLength: readNumber('DATA_EXTENSIONS_MAX_QUERY_LENGTH', 20000),
  depth: readNumber('DATA_EXTENSIONS_MAX_DEPTH', 8),
  aliases: readNumber('DATA_EXTENSIONS_MAX_ALIASES', 30),
  rootFields: readNumber('DATA_EXTENSIONS_MAX_ROOT_FIELDS', 20),
  /** Records one request may resolve, across lookups and relation lists. */
  records: readNumber('DATA_EXTENSIONS_MAX_RECORDS', 2000),
};

const selectionDepth = (
  selectionSet: SelectionSetNode | undefined,
  fragments: Record<string, FragmentDefinitionNode>,
  visiting: Set<string>,
): number => {
  if (!selectionSet) {
    return 0;
  }

  let deepest = 0;

  for (const selection of selectionSet.selections) {
    let depth = 0;

    if (selection.kind === Kind.FIELD) {
      depth = selection.selectionSet
        ? 1 + selectionDepth(selection.selectionSet, fragments, visiting)
        : 1;
    } else if (selection.kind === Kind.INLINE_FRAGMENT) {
      depth = selectionDepth(selection.selectionSet, fragments, visiting);
    } else {
      const name = selection.name.value;
      const fragment = fragments[name];

      if (fragment && !visiting.has(name)) {
        visiting.add(name);
        depth = selectionDepth(fragment.selectionSet, fragments, visiting);
        visiting.delete(name);
      }
    }

    deepest = Math.max(deepest, depth);
  }

  return deepest;
};

/** Rejects documents nested deeper than the configured limit. */
export const maxDepthRule: ValidationRule = (
  context: ValidationContext,
): ASTVisitor => {
  const fragments: Record<string, FragmentDefinitionNode> = {};

  for (const definition of context.getDocument().definitions) {
    if (definition.kind === Kind.FRAGMENT_DEFINITION) {
      fragments[definition.name.value] = definition;
    }
  }

  return {
    OperationDefinition(operation) {
      const depth = selectionDepth(
        operation.selectionSet,
        fragments,
        new Set(),
      );

      if (depth > LIMITS.depth) {
        context.reportError(
          new GraphQLError(`Query depth ${depth} exceeds ${LIMITS.depth}`),
        );
      }

      if (operation.selectionSet.selections.length > LIMITS.rootFields) {
        context.reportError(
          new GraphQLError(`At most ${LIMITS.rootFields} root fields`),
        );
      }
    },
  };
};

/** Caps aliases so one request cannot fan out into many owner calls. */
export const maxAliasesRule: ValidationRule = (
  context: ValidationContext,
): ASTVisitor => {
  let aliases = 0;

  return {
    Field(node) {
      if (node.alias) {
        aliases++;

        if (aliases === LIMITS.aliases + 1) {
          context.reportError(
            new GraphQLError(`At most ${LIMITS.aliases} aliases`),
          );
        }
      }
    },
  };
};

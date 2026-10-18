import {
  getNamedType,
  isObjectType,
  isInterfaceType,
  type GraphQLSchema,
  type GraphQLNamedType,
  type SelectionSetNode,
  type DocumentNode,
} from 'graphql';
import { extractAgentReferences } from './references';

const RECORD_TYPES: Record<string, string> = {
  Customer: 'customer',
  Company: 'company',
  User: 'user',
  Product: 'product',
  Branch: 'branch',
  Department: 'department',
  Unit: 'unit',
  Brand: 'brand',
  Deal: 'deal',
  SalesDeal: 'deal',
  Conversation: 'conversation',
};

/** Derive record types from the schema, including aliases and list wrappers. */
export const extractGraphqlReferences = (
  schema: GraphQLSchema,
  document: DocumentNode,
  data: unknown,
): string[] => {
  const tokens = new Set<string>();
  const fragments = new Map(
    document.definitions.flatMap((definition) =>
      definition.kind === 'FragmentDefinition'
        ? [[definition.name.value, definition] as const]
        : [],
    ),
  );
  const visit = (
    type: GraphQLNamedType,
    selections: SelectionSetNode,
    value: unknown,
  ): void => {
    if (tokens.size >= 25) return;
    if (Array.isArray(value)) {
      for (const item of value) visit(type, selections, item);
      return;
    }
    if (!value || typeof value !== 'object') return;
    const record = value as Record<string, unknown>;
    const kind = RECORD_TYPES[type.name];
    if (kind)
      for (const token of extractAgentReferences(kind, record))
        tokens.add(token);
    if (!isObjectType(type) && !isInterfaceType(type)) return;
    for (const selection of selections.selections) {
      if (selection.kind === 'Field') {
        const field = type.getFields()[selection.name.value];
        if (field && selection.selectionSet) {
          visit(
            getNamedType(field.type),
            selection.selectionSet,
            record[selection.alias?.value ?? selection.name.value],
          );
        }
      } else {
        const fragment =
          selection.kind === 'FragmentSpread'
            ? fragments.get(selection.name.value)
            : selection;
        if (!fragment) continue;
        const fragmentType = fragment.typeCondition
          ? schema.getType(fragment.typeCondition.name.value)
          : type;
        if (fragmentType) visit(fragmentType, fragment.selectionSet, record);
      }
    }
  };
  for (const definition of document.definitions) {
    if (definition.kind !== 'OperationDefinition') continue;
    const root =
      definition.operation === 'mutation'
        ? schema.getMutationType()
        : schema.getQueryType();
    if (root) visit(root, definition.selectionSet, data);
  }
  return [...tokens].slice(0, 25);
};

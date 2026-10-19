import {
  getNamedType,
  isObjectType,
  isInterfaceType,
  isUnionType,
  isAbstractType,
  type GraphQLSchema,
  type GraphQLNamedType,
  type SelectionSetNode,
  type DocumentNode,
  type FragmentDefinitionNode,
  type FieldNode,
} from 'graphql';
import { extractAgentReferences } from './references';

export const AGENTS_GRAPHQL_RECORD_TYPES: Record<string, string> = {
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
const recordOf = (value: unknown): Record<string, unknown> | undefined =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

/** Read fields by their schema identity, not the alias chosen by the model.
 * A result alias `_id: code` must never become a record's identity. */
export const extractGraphqlReferences = (
  schema: GraphQLSchema,
  document: DocumentNode,
  data: unknown,
  operationName?: string,
): string[] => {
  const tokens = new Set<string>();
  const fragments = new Map<string, FragmentDefinitionNode>(
    document.definitions.flatMap((definition) =>
      definition.kind === 'FragmentDefinition'
        ? [[definition.name.value, definition]]
        : [],
    ),
  );
  const fieldsFor = (
    type: GraphQLNamedType,
    selections: SelectionSetNode,
    seen = new Set<string>(),
  ): FieldNode[] => {
    const fields: FieldNode[] = [];
    for (const selection of selections.selections) {
      if (selection.kind === 'Field') {
        fields.push(selection);
        continue;
      }
      const name =
        selection.kind === 'FragmentSpread' ? selection.name.value : undefined;
      if (name && seen.has(name)) continue;
      const fragment = name
        ? fragments.get(name)
        : selection.kind === 'InlineFragment'
        ? selection
        : undefined;
      if (!fragment) continue;
      const condition = fragment.typeCondition
        ? schema.getType(fragment.typeCondition.name.value)
        : type;
      if (
        !condition ||
        (condition !== type &&
          !(
            isAbstractType(condition) &&
            isObjectType(type) &&
            schema.isSubType(condition, type)
          ))
      )
        continue;
      const nested = new Set(seen);
      if (name) nested.add(name);
      fields.push(...fieldsFor(type, fragment.selectionSet, nested));
    }
    return fields;
  };
  const visit = (
    declaredType: GraphQLNamedType,
    selections: SelectionSetNode,
    value: unknown,
  ): Record<string, unknown> | undefined => {
    const record = recordOf(value);
    if (!record || tokens.size >= 25) return undefined;
    let type = declaredType;
    if (isInterfaceType(type) || isUnionType(type)) {
      const typename = fieldsFor(type, selections).find(
        (field) => field.name.value === '__typename',
      );
      const runtime = typename && record[typename.alias?.value ?? '__typename'];
      const concrete =
        typeof runtime === 'string' ? schema.getType(runtime) : undefined;
      if (
        !concrete ||
        !isObjectType(concrete) ||
        !schema.isSubType(type, concrete)
      )
        return undefined;
      type = concrete;
    }
    if (!isObjectType(type) && !isInterfaceType(type)) return undefined;
    const canonical: Record<string, unknown> = {};
    for (const selection of fieldsFor(type, selections)) {
      const field = type.getFields()[selection.name.value];
      if (!field) continue;
      const result = record[selection.alias?.value ?? selection.name.value];
      const selectionSet = selection.selectionSet;
      if (selectionSet) {
        const childType = getNamedType(field.type);
        canonical[selection.name.value] = Array.isArray(result)
          ? result.map((item) => visit(childType, selectionSet, item))
          : visit(childType, selectionSet, result);
      } else {
        canonical[selection.name.value] = result;
      }
    }
    const kind = AGENTS_GRAPHQL_RECORD_TYPES[type.name];
    if (kind)
      for (const token of extractAgentReferences(kind, canonical))
        tokens.add(token);
    return canonical;
  };
  const operations = document.definitions.filter(
    (definition) => definition.kind === 'OperationDefinition',
  );
  const selected = operationName
    ? operations.filter((operation) => operation.name?.value === operationName)
    : operations.length === 1
    ? operations
    : [];
  for (const definition of selected) {
    const root =
      definition.operation === 'mutation'
        ? schema.getMutationType()
        : schema.getQueryType();
    if (root) visit(root, definition.selectionSet, data);
  }
  return [...tokens].slice(0, 25);
};

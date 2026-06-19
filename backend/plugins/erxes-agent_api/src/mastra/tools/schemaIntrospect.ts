// ---------------------------------------------------------------------------
// GraphQL schema introspection — pure type-ref unpacking → field specs.
//
// The erxes operation registry serves each query/mutation as an introspection
// shape ({kind, name, ofType} type refs + arg/field lists). These pure helpers
// turn that shape into the things the executor needs: an exact GraphQL type
// string, a Zod input schema, and a valid response selection set. No I/O — the
// fetch/execute concerns live in erxesTools.ts which composes these.
// ---------------------------------------------------------------------------

import { z } from 'zod';

// GraphQL introspection type-ref shape ({kind, name, ofType}) as served by
// the erxes operation registry, plus the argument entries that carry one.
export interface GqlTypeRef {
  kind?: string;
  name?: string;
  ofType?: GqlTypeRef | null;
}
export interface GqlArgDef {
  name: string;
  description?: string | null;
  type?: GqlTypeRef | null;
}

/** One introspected field of a GraphQL OBJECT type (also describes operations). */
export interface GqlFieldDef {
  name: string;
  description?: string | null;
  type?: GqlTypeRef | null;
  args?: GqlArgDef[];
}

// LLMs often serialize array/object values as JSON strings when calling tools,
// and frequently use Python-style single quotes instead of standard JSON double
// quotes (e.g. "['id1','id2']" instead of ["id1","id2"]).  Both forms must be
// coerced back to the real type so Zod validation never rejects valid LLM output.
function parseJsonPreprocess(val: unknown): unknown {
  if (typeof val !== 'string') return val;
  // 1. Standard JSON — handles properly-quoted strings and arrays.
  try {
    return JSON.parse(val);
  } catch {
    /* fall through */
  }
  // 2. Python-style single-quoted literals — only attempt when the value looks
  //    like a list or object so we don't mangle plain string scalars.
  const trimmed = val.trim();
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      return JSON.parse(trimmed.replace(/'/g, '"'));
    } catch {
      /* keep as-is */
    }
  }
  return val;
}

// Recursively reconstruct the GraphQL type string (e.g. "[String!]!") from the
// introspection type object so variable definitions in built operations are exact.
export function graphqlTypeToString(
  type: GqlTypeRef | null | undefined,
): string {
  if (!type) return 'String';
  if (type.kind === 'NON_NULL') return `${graphqlTypeToString(type.ofType)}!`;
  if (type.kind === 'LIST') return `[${graphqlTypeToString(type.ofType)}]`;
  return type.name || 'String';
}

// inputTypesMap: name → inputFields[], populated via fetchInputTypesMap().
// Passed through the Zod builders so INPUT_OBJECT types get real schemas
// instead of z.any(), giving the LLM correct field names up front.
function graphqlTypeToZod(
  type: GqlTypeRef | null | undefined,
  inputTypesMap?: Record<string, GqlArgDef[]>,
): z.ZodTypeAny {
  if (!type) return z.any().optional();
  const name = type.name || '';
  const kind = type.kind || '';

  if (kind === 'LIST') {
    return z.preprocess(
      parseJsonPreprocess,
      z.array(graphqlTypeToZod(type.ofType, inputTypesMap)).optional(),
    );
  }
  if (kind === 'NON_NULL') {
    return graphqlTypeToZod(type.ofType, inputTypesMap);
  }
  if (kind === 'INPUT_OBJECT' && inputTypesMap?.[name]) {
    const fields = inputTypesMap[name];
    const shape: Record<string, z.ZodTypeAny> = {};
    for (const field of fields) {
      shape[field.name] = graphqlTypeToZod(field.type, inputTypesMap);
    }
    // Preprocess so objects serialised as strings by the LLM are parsed first.
    return z.preprocess(parseJsonPreprocess, z.object(shape).optional());
  }

  switch (name) {
    case 'Int':
    case 'Float':
      // LLMs often send numbers as strings ("0", "30"). z.coerce.number() converts
      // them before Zod validates, so "0" → 0 and 30 stays 30.
      return z.coerce.number().optional();
    case 'Boolean':
      // z.coerce.boolean() is wrong here: it treats any non-empty string as true,
      // so "false" → true. Use an explicit preprocessor instead.
      return z.preprocess((val) => {
        if (typeof val !== 'string') return val;
        const lower = val.toLowerCase().trim();
        if (lower === 'true' || lower === '1' || lower === 'yes') return true;
        if (lower === 'false' || lower === '0' || lower === 'no') return false;
        return val;
      }, z.boolean().optional());
    case 'String':
    case 'ID':
      return z.string().optional();
    case 'Date':
      // erxes accepts dates only as "YYYY-MM-DD" strings.
      // LLMs often send ISO datetimes ("2026-06-07T00:00:00Z"), relative words
      // ("today"), or other formats.  Normalize everything to YYYY-MM-DD here;
      // if the string is not a valid date at all, return undefined so isNoopValue
      // drops it from the GraphQL variables rather than sending garbage.
      return z.preprocess((val) => {
        if (val === undefined || val === null) return val;
        if (typeof val !== 'string') return val;
        const trimmed = val.trim();
        if (!trimmed) return undefined;
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
        if (trimmed.includes('T')) return trimmed.split('T')[0];
        const parsed = new Date(trimmed);
        if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
        return undefined;
      }, z.string().optional());
    case 'JSON':
      return z.preprocess(parseJsonPreprocess, z.any().optional());
    default:
      return z.any().optional();
  }
}

/** Build the tool input schema from the operation's introspected args. */
export function buildZodSchemaFromArgs(
  args: GqlArgDef[],
  inputTypesMap?: Record<string, GqlArgDef[]>,
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const arg of args || []) {
    shape[arg.name] = graphqlTypeToZod(arg.type, inputTypesMap);
  }
  return z.object(shape);
}

/** Unwrap NON_NULL/LIST wrappers to the underlying return-type kind. */
function resolveReturnTypeKind(type: GqlTypeRef | null | undefined): string {
  if (!type) return 'UNKNOWN';
  if (type.kind === 'NON_NULL' || type.kind === 'LIST')
    return resolveReturnTypeKind(type.ofType);
  return type.kind || 'UNKNOWN';
}

/** True when the operation's return type requires a GraphQL selection set. */
export function needsSelectionSet(
  returnType: GqlTypeRef | null | undefined,
): boolean {
  const kind = resolveReturnTypeKind(returnType);
  return kind !== 'SCALAR' && kind !== 'ENUM';
}

/** Unwrap NON_NULL/LIST wrappers to the underlying named return type. */
export function resolveReturnTypeName(
  type: GqlTypeRef | null | undefined,
): string {
  if (!type) return '';
  if (type.kind === 'NON_NULL' || type.kind === 'LIST')
    return resolveReturnTypeName(type.ofType);
  return type.name || '';
}

// ─── Response-selection builder (introspection-driven) ───────────────────────
//
// The naive default `_id name` breaks on object types that have no `name` field
// (e.g. User → email/username), causing erxes to reject the query with a
// field-selection error and the tool to fail. These helpers build a VALID
// selection set from the actual schema fields of the return type.

const LEAF_KINDS = new Set(['SCALAR', 'ENUM']);

/** Unwrap NON_NULL / LIST wrappers down to the named type. */
function namedTypeOf(type: GqlTypeRef | null | undefined): {
  kind: string;
  name: string;
} {
  if (!type) return { kind: 'SCALAR', name: 'String' };
  if (type.kind === 'NON_NULL' || type.kind === 'LIST')
    return namedTypeOf(type.ofType);
  return { kind: type.kind || 'SCALAR', name: type.name || '' };
}

/**
 * A selection of safe leaf (scalar/enum) fields for an OBJECT type, always
 * including _id, capped to keep results lean.
 */
function buildSelectionForType(
  typeName: string,
  objectFieldsMap: Record<string, GqlFieldDef[]>,
  maxFields = 12,
): string {
  const fields = objectFieldsMap[typeName];
  if (!fields || !fields.length) return '_id';
  const leaves: string[] = fields
    .filter((field) => LEAF_KINDS.has(namedTypeOf(field.type).kind))
    .map((field) => field.name);
  if (!leaves.length) return '_id';
  // Keep _id first when it exists; never inject it if the type lacks one.
  const ordered = leaves.includes('_id')
    ? ['_id', ...leaves.filter((n) => n !== '_id')]
    : leaves;
  return ordered.slice(0, maxFields).join(' ');
}

/**
 * Build a valid selection for an operation's return type. Handles ListResponse /
 * Connection wrappers (selects inner items + totalCount) and plain object types.
 */
function buildIntrospectedSelection(
  returnType: GqlTypeRef | null | undefined,
  objectFieldsMap?: Record<string, GqlFieldDef[]>,
): string | undefined {
  if (!objectFieldsMap) return undefined;
  const rootName = resolveReturnTypeName(returnType);
  const rootFields = rootName ? objectFieldsMap[rootName] : undefined;
  if (!rootFields) return undefined;

  const listField = rootFields.find((field) => field.name === 'list');
  if (listField) {
    const itemType = namedTypeOf(listField.type).name;
    const inner = buildSelectionForType(itemType, objectFieldsMap);
    const hasTotal = rootFields.some((field) => field.name === 'totalCount');
    return `list { ${inner} }${hasTotal ? ' totalCount' : ''}`;
  }
  return buildSelectionForType(rootName, objectFieldsMap);
}

/**
 * Build a VALID selection from agent-requested field paths. Paths are dotted with
 * at most one level of nesting ("amount", "customer.name"). Validation rules:
 *   • unknown fields and paths deeper than one level are dropped;
 *   • a bare object field auto-expands to that type's default leaf fields;
 *   • sibling nested children group under their parent ("customer { name email }");
 *   • _id is always included when the (item) type exposes one.
 * List / Connection wrappers apply the selection to the inner item type and keep
 * `totalCount`. Returns undefined when nothing valid remains, so the caller falls
 * back to the auto selection.
 */
function buildRequestedSelection(
  returnType: GqlTypeRef | null | undefined,
  requestedFields: string[],
  objectFieldsMap: Record<string, GqlFieldDef[]>,
): string | undefined {
  const rootName = resolveReturnTypeName(returnType);
  const rootFields = rootName ? objectFieldsMap[rootName] : undefined;
  if (!rootFields) return undefined;

  // For list/connection wrappers the requested fields describe the inner item
  // type, not the wrapper itself.
  const listField = rootFields.find((field) => field.name === 'list');
  const baseTypeName = listField ? namedTypeOf(listField.type).name : rootName;
  const baseFields = objectFieldsMap[baseTypeName];
  if (!baseFields || !baseFields.length) return undefined;

  const byName = new Map(baseFields.map((field) => [field.name, field]));
  const leaves: string[] = [];
  const nested = new Map<string, Set<string>>();

  const childLeavesOf = (typeName: string): string[] =>
    (objectFieldsMap[typeName] || [])
      .filter((field) => LEAF_KINDS.has(namedTypeOf(field.type).kind))
      .map((field) => field.name);

  for (const raw of requestedFields) {
    const [head, child] = String(raw || '')
      .trim()
      .split('.');
    if (!head) continue;
    const field = byName.get(head);
    if (!field) continue;
    const named = namedTypeOf(field.type);

    if (!child) {
      if (LEAF_KINDS.has(named.kind)) {
        if (!leaves.includes(head)) leaves.push(head);
      } else if (named.kind === 'OBJECT') {
        // Bare object field → auto-expand to its default leaves.
        const set = nested.get(head) ?? new Set<string>();
        childLeavesOf(named.name)
          .slice(0, 12)
          .forEach((leaf) => set.add(leaf));
        if (set.size) nested.set(head, set);
      }
      continue;
    }

    // Depth-2 path: parent must be an object, child a leaf field on it.
    if (named.kind !== 'OBJECT') continue;
    const childField = (objectFieldsMap[named.name] || []).find(
      (candidate) => candidate.name === child,
    );
    if (!childField || !LEAF_KINDS.has(namedTypeOf(childField.type).kind))
      continue;
    const set = nested.get(head) ?? new Set<string>();
    set.add(child);
    nested.set(head, set);
  }

  if (!leaves.length && !nested.size) return undefined;

  // Always include _id when the type exposes one — almost every follow-up op
  // needs it and it costs a single field.
  if (byName.has('_id') && !leaves.includes('_id')) leaves.unshift('_id');

  const inner = [
    ...leaves,
    ...[...nested.entries()].map(
      ([parent, children]) => `${parent} { ${[...children].join(' ')} }`,
    ),
  ].join(' ');

  if (listField) {
    const hasTotal = rootFields.some((field) => field.name === 'totalCount');
    return `list { ${inner} }${hasTotal ? ' totalCount' : ''}`;
  }
  return inner;
}

/** Compact menu of the fields an agent may request for an operation. */
export interface SelectableFields {
  type: string;
  isList: boolean;
  fields: string[];
  nested: Record<string, string[]>;
}

/**
 * Describe the fields selectable for an operation's return type, so the agent can
 * choose a response shape in the same round-trip it discovers the op. Leaf
 * scalars/enums are listed directly; object fields expose one level of leaf
 * children (capped). List/connection wrappers describe the inner item type.
 */
export function describeSelectableFields(
  returnType: GqlTypeRef | null | undefined,
  objectFieldsMap?: Record<string, GqlFieldDef[]>,
): SelectableFields | undefined {
  if (!objectFieldsMap) return undefined;
  const rootName = resolveReturnTypeName(returnType);
  const rootFields = rootName ? objectFieldsMap[rootName] : undefined;
  if (!rootFields) return undefined;

  const listField = rootFields.find((field) => field.name === 'list');
  const baseTypeName = listField ? namedTypeOf(listField.type).name : rootName;
  const baseFields = objectFieldsMap[baseTypeName];
  if (!baseFields || !baseFields.length) return undefined;

  const MAX_NESTED_OBJECTS = 8;
  const MAX_CHILDREN = 6;
  const fields: string[] = [];
  const nested: Record<string, string[]> = {};
  let objectCount = 0;

  for (const field of baseFields) {
    const named = namedTypeOf(field.type);
    if (LEAF_KINDS.has(named.kind)) {
      fields.push(field.name);
    } else if (named.kind === 'OBJECT' && objectCount < MAX_NESTED_OBJECTS) {
      const children = (objectFieldsMap[named.name] || [])
        .filter((child) => LEAF_KINDS.has(namedTypeOf(child.type).kind))
        .map((child) => child.name)
        .slice(0, MAX_CHILDREN);
      if (children.length) {
        nested[field.name] = children;
        objectCount += 1;
      }
    }
  }

  if (!fields.length && !Object.keys(nested).length) return undefined;
  return { type: baseTypeName, isList: Boolean(listField), fields, nested };
}

/** Pick the response selection: curated override, requested, introspected, or stored. */
export function chooseResponseFields(
  erxesOperation: string,
  storedFields: string | undefined,
  returnType: GqlTypeRef | null | undefined,
  objectFieldsMap?: Record<string, GqlFieldDef[]>,
  requestedFields?: string[],
): string | undefined {
  if (erxesOperation === 'dealsAdd') return '_id name stageId';
  // Agent-requested fields win when at least one validates against the schema;
  // invalid names are dropped inside buildRequestedSelection, and an all-invalid
  // request falls through to the auto selection below.
  if (requestedFields?.length && objectFieldsMap) {
    const requested = buildRequestedSelection(
      returnType,
      requestedFields,
      objectFieldsMap,
    );
    if (requested) return requested;
  }
  // Schema-introspected selection is authoritative whenever the return type is
  // resolvable — the stored erxesResponseFields are auto-generated and often
  // invalid for the type (e.g. `_id` on a *ListResponse`, or `name` on User).
  const introspected = buildIntrospectedSelection(returnType, objectFieldsMap);
  if (introspected) return introspected;
  const stored = (storedFields || '').trim();
  return stored || undefined;
}

/**
 * Returns true when the value carries no meaningful data and should be omitted
 * from the GraphQL operation rather than sent as an empty/noise variable.
 * LLMs routinely fill optional string args with "" as a "nothing here"
 * placeholder. Empty arrays/objects are deliberately KEPT: models pass them on
 * purpose (e.g. customersCount(types: []) to satisfy a resolver that iterates
 * the arg), and stripping them turns a correct call into a server crash.
 */
export function isNoopValue(val: unknown): boolean {
  return (
    val === undefined ||
    val === null ||
    (typeof val === 'string' && val.trim() === '')
  );
}

/** Assemble a runnable GraphQL document + variables for one operation call. */
export function buildGraphqlOperation(
  operation: string,
  operationType: 'query' | 'mutation',
  args: GqlArgDef[],
  inputArgs: Record<string, unknown>,
  returnType?: GqlTypeRef | null,
  responseFields?: string,
): { query: string; variables: Record<string, unknown> } {
  const provided = (args || []).filter(
    (argDef) => !isNoopValue(inputArgs[argDef.name]),
  );

  const varDefs = provided
    .map((argDef) => {
      return `$${argDef.name}: ${graphqlTypeToString(argDef.type)}`;
    })
    .join(', ');

  const argList = provided
    .map((argDef) => `${argDef.name}: $${argDef.name}`)
    .join(', ');
  const variables: Record<string, unknown> = {};
  for (const argDef of provided)
    variables[argDef.name] = inputArgs[argDef.name];

  // Add a selection set for object return types; skip for scalars/enums.
  // When no explicit responseFields are configured, choose a sensible default:
  // - ListResponse wrapper types (e.g. SalesPipelinesListResponse) expose
  //   their items under a `list` field — select that with _id + name.
  // - Regular object / array types: select _id + name so the LLM can
  //   identify records by name, not just raw MongoDB IDs.
  let defaultFields = '_id name';
  if (!responseFields) {
    const rootTypeName = resolveReturnTypeName(returnType);
    if (
      rootTypeName.endsWith('ListResponse') ||
      rootTypeName.endsWith('Connection')
    ) {
      defaultFields = 'list { _id name } totalCount';
    }
  }
  const selection = needsSelectionSet(returnType)
    ? ` { ${responseFields || defaultFields} }`
    : '';

  const opStr = `${operation}${argList ? `(${argList})` : ''}${selection}`;
  const queryStr =
    operationType === 'mutation'
      ? `mutation Run${varDefs ? `(${varDefs})` : ''} { ${opStr} }`
      : `query Run${varDefs ? `(${varDefs})` : ''} { ${opStr} }`;

  return { query: queryStr, variables };
}

/**
 * Neutral defaults ([] for list args, {} for input-object args) for every
 * argument the model did not provide. Used to auto-recover from erxes
 * resolvers that dereference optional args without guarding (e.g.
 * getTicketPipelines reads filter.name, customersCount iterates types) and
 * crash when the arg is legitimately omitted. Returns null when there is
 * nothing to fill — no retry possible.
 */
export function withNeutralDefaults(
  argDefs: GqlArgDef[],
  provided: Record<string, unknown>,
): Record<string, unknown> | null {
  const filled: Record<string, unknown> = { ...provided };
  let added = false;
  for (const argDef of argDefs || []) {
    if (!isNoopValue(filled[argDef.name])) continue;
    let argType = argDef.type;
    while (argType && argType.kind === 'NON_NULL') argType = argType.ofType;
    if (!argType) continue;
    if (argType.kind === 'LIST') {
      filled[argDef.name] = [];
      added = true;
    } else if (argType.kind === 'INPUT_OBJECT') {
      filled[argDef.name] = {};
      added = true;
    }
  }
  return added ? filled : null;
}

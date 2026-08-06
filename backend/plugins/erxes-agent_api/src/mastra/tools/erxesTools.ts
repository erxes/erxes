import { z } from 'zod';
import { getPlugins, getPluginAddress } from 'erxes-api-shared/utils';
import { getCurrentAuth } from '../requestContext';
import { splitCamelWords } from '~/mastra/text';
import type { OperationMeta } from './operationRegistry';

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

/** Connection settings for reaching the erxes gateway (API URL + app token). */
export interface ErxesToolSettings {
  erxesApiUrl?: string;
  erxesApiToken?: string;
}

/** Minimal GraphQL HTTP response envelope. */
interface GraphqlEnvelope {
  data?: Record<string, unknown> | null;
  errors?: Array<{ message: string }>;
}

/** One named type entry from a `__schema { types }` introspection result. */
interface IntrospectedNamedType {
  name: string;
  kind: string;
  inputFields?: GqlArgDef[] | null;
  fields?: GqlFieldDef[] | null;
}

/** Clip text to the first maxWords words, appending an ellipsis when cut. */
function truncateWords(text: string, maxWords = 15): string {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  return words.length <= maxWords
    ? text
    : `${words.slice(0, maxWords).join(' ')}...`;
}

// erxes' GraphQL schema carries no field descriptions, so operation names are
// all we have. Turn a camelCase operation into a readable action phrase so both
// the UI picker and the agent see "Create a deal" instead of "mutation dealsAdd".
const OPERATION_VERBS: Record<string, string> = {
  add: 'Create',
  create: 'Create',
  save: 'Create or update',
  edit: 'Update',
  update: 'Update',
  remove: 'Delete',
  delete: 'Delete',
  detail: 'Get one',
  details: 'Get one',
  merge: 'Merge',
  duplicate: 'Duplicate',
  count: 'Count',
  list: 'List',
  tag: 'Tag',
  assign: 'Assign',
  change: 'Change',
  send: 'Send',
  verify: 'Verify',
  resolve: 'Resolve',
  cancel: 'Cancel',
  confirm: 'Confirm',
};

// The gateway's userMiddleware only accepts `Authorization: Bearer <token>`
// (raw tokens silently fall through to anonymous → "Login required").
export const asBearer = (token?: string | null): string =>
  !token ? '' : /^Bearer\s/i.test(token) ? token : `Bearer ${token}`;

// Curated descriptions for high-value operations whose names are unguessable
// from search keywords. The erxes schema carries no field descriptions, so the
// auto-derived text for these is useless (tagsTag → "tags tag") and the model
// burns whole turns hunting for a capability that exists. Keyed by exact
// operation name; consulted before the humanized fallback.
export const CURATED_OP_DESCRIPTIONS: Record<string, string> = {
  tagsTag:
    'Assign tags to records — set the tags of customers, companies, or other records. Args: type (e.g. "core:customer"), targetIds (record ids), tagIds (tag ids; replaces the record\'s tags)',
  tagsAdd:
    'Create a new tag (does NOT assign it to any record — use tagsTag for that)',
  tags: 'List existing tags (filter by type, e.g. "core:customer")',
};

/** Turn a camelCase operation name into a readable action phrase. */
export function humanizeOperation(
  name: string,
  opType: 'query' | 'mutation',
): string {
  const curated = CURATED_OP_DESCRIPTIONS[name];
  if (curated) return curated;
  const words = splitCamelWords(name || '');

  // Find the first recognized verb anywhere in the name; the rest is the entity.
  let verb: string | undefined;
  const rest: string[] = [];
  for (const w of words) {
    const key = w.toLowerCase();
    if (!verb && OPERATION_VERBS[key]) verb = OPERATION_VERBS[key];
    else rest.push(w);
  }

  const entity = rest.join(' ').toLowerCase().trim();
  if (verb) return entity ? `${verb} ${entity}` : verb;

  // No verb (typically a read): "Get customers", "Run something".
  const phrase = words.join(' ').toLowerCase();
  return `${opType === 'query' ? 'Get' : 'Run'} ${phrase}`.trim();
}

// Leading filler words that aren't the entity (allBrands → brands).
const MODULE_LEADING_QUALIFIERS = new Set([
  'all',
  'active',
  'current',
  'get',
  'my',
  'recent',
  'list',
  'total',
  'search',
]);

// Best-effort "module"/entity grouping for an operation. erxes exposes no
// per-operation module map, so we derive the entity noun from the operation
// name (strip a leading filler word: allBrands → brands, currentUser → user,
// activeExports → exports). Dynamic — no hardcoded module lists.
export function deriveModule(operation: string): string {
  const words = splitCamelWords(operation || '');
  if (!words.length) return 'other';
  if (
    words.length > 1 &&
    MODULE_LEADING_QUALIFIERS.has(words[0].toLowerCase())
  ) {
    return words[1].toLowerCase();
  }
  return words[0].toLowerCase();
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
function buildZodSchemaFromArgs(
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
function needsSelectionSet(returnType: GqlTypeRef | null | undefined): boolean {
  const kind = resolveReturnTypeKind(returnType);
  return kind !== 'SCALAR' && kind !== 'ENUM';
}

/** Unwrap NON_NULL/LIST wrappers to the underlying named return type. */
function resolveReturnTypeName(type: GqlTypeRef | null | undefined): string {
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

/** Pick the response selection: curated override, introspected, or stored fields. */
function chooseResponseFields(
  erxesOperation: string,
  storedFields: string | undefined,
  returnType: GqlTypeRef | null | undefined,
  objectFieldsMap?: Record<string, GqlFieldDef[]>,
): string | undefined {
  if (erxesOperation === 'dealsAdd') return '_id name stageId';
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
function isNoopValue(val: unknown): boolean {
  return (
    val === undefined ||
    val === null ||
    (typeof val === 'string' && val.trim() === '')
  );
}

/** Assemble a runnable GraphQL document + variables for one operation call. */
function buildGraphqlOperation(
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

// ---------------------------------------------------------------------------
// Auto-resolution helpers
//
// When a GraphQL operation fails with "X not found", the tool should NOT tell
// the LLM to call other tools (those tools may not be in the agent's toolset).
// Instead, the tool resolves the dependency chain itself and returns real IDs
// in the error payload so the LLM can retry immediately with a valid value.
// ---------------------------------------------------------------------------

/** Fire one GraphQL query and return its `data` payload, or null on any failure. */
async function gqlCall<TData = Record<string, unknown>>(
  apiUrl: string,
  authHeaders: Record<string, string>,
  query: string,
): Promise<TData | null> {
  try {
    const res = await fetch(`${apiUrl}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ query }),
    });
    const json = (await res.json()) as { data?: TData | null };
    return json?.data ?? null;
  } catch {
    return null;
  }
}

/** Minimal `{ _id, name }` record shape returned by board/pipeline/stage queries. */
interface IdNameRecord {
  _id: string;
  name?: string;
}

/** One auto-resolved entity option offered back to the model. */
interface ResolvedEntityOption {
  stageId?: string;
  stageName?: string;
  name?: string;
}

/**
 * Returns a deduplicated list of { stageId, stageName } across all boards/pipelines.
 * Only stageName is exposed to the LLM — the raw ObjectId is resolved internally.
 */
async function resolveAvailableStages(
  apiUrl: string,
  authHeaders: Record<string, string>,
): Promise<ResolvedEntityOption[]> {
  const boardsData = await gqlCall<{ salesBoards?: IdNameRecord[] }>(
    apiUrl,
    authHeaders,
    '{ salesBoards { _id name } }',
  );
  const boards = boardsData?.salesBoards ?? [];
  const seen = new Set<string>();
  const stages: ResolvedEntityOption[] = [];

  for (const board of boards.slice(0, 5)) {
    const pipData = await gqlCall<{
      salesPipelines?: { list?: IdNameRecord[] };
    }>(
      apiUrl,
      authHeaders,
      `{ salesPipelines(boardId: "${board._id}") { list { _id name } } }`,
    );
    const pipelines = pipData?.salesPipelines?.list ?? [];

    for (const pipeline of pipelines.slice(0, 5)) {
      const stData = await gqlCall<{ salesStages?: IdNameRecord[] }>(
        apiUrl,
        authHeaders,
        `{ salesStages(pipelineId: "${pipeline._id}") { _id name } }`,
      );
      for (const stage of stData?.salesStages ?? []) {
        if (seen.has(stage._id)) continue;
        seen.add(stage._id);
        stages.push({ stageId: stage._id, stageName: stage.name });
      }
    }
  }
  return stages;
}

// Entity → auto-resolver function.  Add new entities here as needed.
type EntityResolver = (
  apiUrl: string,
  headers: Record<string, string>,
) => Promise<ResolvedEntityOption[]>;
const ENTITY_RESOLVERS: Record<
  string,
  { key: string; resolver: EntityResolver }
> = {
  stage: { key: 'availableStages', resolver: resolveAvailableStages },
};

// Turns a raw GraphQL error from the gateway into a clean, model-usable result.
// erxes server resolvers sometimes CRASH on missing/empty args (e.g.
// getTicketPipelines → "Cannot read properties of undefined (reading 'name')",
// salesPipelines → "Cannot return null for non-nullable field …") instead of
// validating. Those internal stack-ish messages must never reach the user, and
// the model should be told to provide the required arguments rather than retry
// the same empty call.
const INTERNAL_ERROR_RE =
  /cannot read propert|undefined \(reading|return null for non-nullable|is not a function|reading '/i;
// Stack-frame heuristic without super-linear backtracking: a " at " marker
// plus a ":line:col)" suffix anywhere in the message.
const STACK_FRAME_RE = /:\d+:\d+\)/;
/** True when the message looks like a raw stack frame rather than a user error. */
const looksLikeStackFrame = (msg: string): boolean =>
  msg.includes(' at ') && STACK_FRAME_RE.test(msg);
const REQUIRED_ARG_RE =
  /argument "([^"]+)" of type|"([^"]+)" is required|required, but it was not provided|was not provided/i;

/**
 * Neutral defaults ([] for list args, {} for input-object args) for every
 * argument the model did not provide. Used to auto-recover from erxes
 * resolvers that dereference optional args without guarding (e.g.
 * getTicketPipelines reads filter.name, customersCount iterates types) and
 * crash when the arg is legitimately omitted. Returns null when there is
 * nothing to fill — no retry possible.
 */
function withNeutralDefaults(
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

/** Turn a raw gateway error into a clean, model-usable { error, instruction }. */
export function sanitizeServerError(raw: string): {
  error: string;
  instruction: string;
} {
  const msg = (raw || '').trim();
  const reqMatch = msg.match(REQUIRED_ARG_RE);
  if (reqMatch && !INTERNAL_ERROR_RE.test(msg) && !looksLikeStackFrame(msg)) {
    // Clean validation error — surface it; it tells the model what to supply.
    return {
      error: msg,
      instruction:
        "This operation needs one or more required arguments. Re-read the operation's argument list from search_erxes_operations and call it again WITH those arguments filled in — never call it with empty args.",
    };
  }
  if (INTERNAL_ERROR_RE.test(msg) || looksLikeStackFrame(msg)) {
    // Internal server crash — hide the stack-ish detail entirely.
    return {
      error:
        'That operation could not be completed (the service rejected the request).',
      instruction:
        'Do NOT show this technical detail to the user and do NOT retry the same call. The operation likely needs required arguments you did not provide, or is not usable this way. Provide the required arguments, choose a different operation, or skip this step and continue.',
    };
  }
  return {
    error: msg,
    instruction:
      'Tell the user in plain words; do not retry the same call unchanged.',
  };
}

/**
 * Map an actionable "not found"/validation error onto a structured failure
 * payload that carries real, currently-available entity options.
 */
async function buildNotFoundResult(
  rawMessage: string,
  apiUrl: string,
  authHeaders: Record<string, string>,
): Promise<Record<string, unknown>> {
  const lower = rawMessage.toLowerCase();
  for (const [entity, { resolver }] of Object.entries(ENTITY_RESOLVERS)) {
    const mentionsEntity = lower.includes(entity);
    // Catch all actionable errors: "not found", "not provided" (GraphQL required-field
    // validation), "invalid", and "required" — not just the "not found" case.
    const isActionable =
      lower.includes('not found') ||
      lower.includes('not provided') ||
      lower.includes('invalid') ||
      lower.includes('required');
    if (mentionsEntity && isActionable) {
      const items = await resolver(apiUrl, authHeaders);
      const names = items
        .map((item) => item.stageName ?? item.name)
        .filter(Boolean);
      return {
        success: false,
        availableStages: names,
        instruction: names.length
          ? `Call dealsAdd immediately with: { stageId: "${
              names[0]
            }", name: "deal name" }. Available stages: ${names.join(', ')}.`
          : `No ${entity}s found. Make sure the erxes sales plugin is configured and has at least one board with a pipeline and stage.`,
      };
    }
  }
  return { success: false, ...sanitizeServerError(rawMessage) };
}

// Shape the executor needs: an operation descriptor as produced by
// fetchAvailableErxesTools / the operation registry.
export interface ErxesOperationRef {
  operation: string;
  operationType: 'query' | 'mutation';
  graphqlArgs?: GqlArgDef[];
  returnType?: GqlTypeRef | null;
}

/** True when the string looks like a 24-hex-char MongoDB ObjectId. */
const isValidObjectId = (value?: string): boolean =>
  /^[a-f0-9]{24}$/i.test(value ?? '');

/**
 * Auth headers for gateway calls: the calling user's request header when
 * present, otherwise the configured app token (bot/no-session calls).
 */
function buildAuthHeaders(appToken: string): Record<string, string> {
  const reqAuth = getCurrentAuth();
  const authHeaders: Record<string, string> = {};
  if (reqAuth?.userHeader) {
    authHeaders['user'] = reqAuth.userHeader;
  } else if (reqAuth?.token || appToken) {
    authHeaders['Authorization'] = asBearer(reqAuth?.token || appToken);
  }
  if (reqAuth?.subdomain) {
    // The gateway resolves the tenant via getSubdomain(), which reads the
    // 'hostname' header before falling back to the request host.
    authHeaders['hostname'] = reqAuth.subdomain;
  }
  return authHeaders;
}

/** Outcome of the dealsAdd stage pre-flight: updated args, or a structured failure. */
type StagePreflight =
  | { ok: true; args: Record<string, unknown> }
  | { ok: false; failure: Record<string, unknown> };

/**
 * dealsAdd pre-flight. LLMs naturally express intent with stage NAMES (e.g.
 * "Test for Ai"), not MongoDB ObjectIds — auto-resolve any name sent as
 * stageId → real ObjectId transparently, so the LLM never has to know or
 * remember the raw database ID.
 */
async function resolveDealsAddStageArg(
  initialArgs: Record<string, unknown>,
  apiUrl: string,
  authHeaders: Record<string, string>,
): Promise<StagePreflight> {
  let resolvedArgs = initialArgs;
  // dealsAdd takes flat top-level args: dealsAdd(name, stageId, ...) — no doc wrapper.
  // Strip surrounding quotes LLMs sometimes add: '"Test for Ai"' → 'Test for Ai'
  const rawStageId = resolvedArgs.stageId;
  let stageId =
    typeof rawStageId === 'string'
      ? rawStageId.replace(/^["']|["']$/g, '').trim()
      : undefined;

  if (isValidObjectId(stageId)) return { ok: true, args: resolvedArgs };

  const stages = await resolveAvailableStages(apiUrl, authHeaders);

  if (stageId) {
    // Fuzzy-match the name the LLM sent against real stage names.
    const needle = stageId.toLowerCase().trim();
    const match =
      stages.find(
        (stage) => (stage.stageName || '').toLowerCase() === needle,
      ) ||
      stages.find((stage) =>
        (stage.stageName || '').toLowerCase().includes(needle),
      );
    if (match) {
      resolvedArgs = { ...resolvedArgs, stageId: match.stageId };
      stageId = match.stageId;
    }
  }

  // If only one stage exists, pick it automatically — no need to ask.
  if (!isValidObjectId(stageId) && stages.length === 1) {
    resolvedArgs = { ...resolvedArgs, stageId: stages[0].stageId };
    stageId = stages[0].stageId;
  }

  if (!isValidObjectId(stageId)) {
    const stageNames = stages.map((stage) => stage.stageName);
    return {
      ok: false,
      failure: {
        success: false,
        availableStages: stageNames,
        instruction: stages.length
          ? `Call dealsAdd immediately with: { stageId: "${
              stageNames[0] ?? 'stage name'
            }", name: "deal name" }. Available stages: ${stageNames.join(
              ', ',
            )}.`
          : 'No stages exist. Tell the user to create a Board with a Pipeline and Stage in erxes Sales first.',
      },
    };
  }

  return { ok: true, args: resolvedArgs };
}

/** Joins GraphQL error messages into one semicolon-separated string. */
const joinErrors = (errs: Array<{ message: string }>): string =>
  errs.map((err) => err.message).join('; ');

/**
 * Runs a single erxes GraphQL operation by name on the user's behalf and returns
 * its result (or a structured { success:false, … } payload the model can act on).
 *
 * This is the shared execution core behind the `execute_erxes_operation`
 * meta-tool. It owns everything that used to live in the per-operation tool:
 *   • coercing LLM-supplied args through the operation's Zod schema,
 *   • the dealsAdd stage-NAME → ObjectId pre-flight,
 *   • building a valid GraphQL operation + response selection,
 *   • turning "not found"/validation errors into actionable instructions.
 *
 * Auth is read from the async request context (the calling user's header) and
 * falls back to the configured app token for bot/no-session calls.
 */
export async function executeErxesOperation(
  op: ErxesOperationRef,
  rawArgs: Record<string, unknown>,
  settings: ErxesToolSettings | null,
  inputTypesMap?: Record<string, GqlArgDef[]>,
  objectFieldsMap?: Record<string, GqlFieldDef[]>,
): Promise<unknown> {
  // Any internal failure (a malformed introspection shape, an undefined field
  // access, a network blip) must become a STRUCTURED result the model can act
  // on — never an exception that surfaces to the user as a raw stack message
  // and strands them.
  try {
    const apiUrl = settings?.erxesApiUrl || 'http://localhost:4000';
    const token = settings?.erxesApiToken || '';
    const erxesOperation = op.operation;
    const erxesOperationType = op.operationType;
    const args = op.graphqlArgs || [];

    // Coerce the model's args through the per-operation Zod schema (numbers sent
    // as strings, JSON-as-string arrays/objects, date normalisation, …). The
    // execute meta-tool passes a plain object, so this is where validation runs;
    // on failure we fall back to the raw args so a usable call still goes out.
    const inputSchema = buildZodSchemaFromArgs(args, inputTypesMap);
    const parsed = inputSchema.safeParse(rawArgs || {});
    let resolvedArgs: Record<string, unknown> = parsed.success
      ? { ...(parsed.data as Record<string, unknown>) }
      : { ...(rawArgs || {}) };

    // Auth must be resolved first — needed for any pre-flight stage lookups.
    const authHeaders = buildAuthHeaders(token);

    if (erxesOperation === 'dealsAdd') {
      const preflight = await resolveDealsAddStageArg(
        resolvedArgs,
        apiUrl,
        authHeaders,
      );
      if (!preflight.ok) return preflight.failure;
      resolvedArgs = preflight.args;
    }

    // Build the GraphQL operation after stageId has been resolved. Choose a
    // VALID response selection derived from the schema (so types without a
    // `name` field, like User, still produce a runnable query).
    const finalResponseFields = chooseResponseFields(
      erxesOperation,
      undefined,
      op.returnType,
      objectFieldsMap,
    );

    /** Builds and POSTs the GraphQL operation with the given args. */
    const runCall = async (
      callArgs: Record<string, unknown>,
    ): Promise<GraphqlEnvelope> => {
      const { query, variables } = buildGraphqlOperation(
        erxesOperation,
        erxesOperationType,
        args,
        callArgs,
        op.returnType,
        finalResponseFields,
      );
      const response = await fetch(`${apiUrl}/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ query, variables }),
      });
      return (await response.json()) as GraphqlEnvelope;
    };

    let data = await runCall(resolvedArgs);

    // ── Crash auto-recovery ───────────────────────────────────────────────
    // Several erxes resolvers crash (500) when a schema-optional arg is
    // omitted. When the failure looks like such a crash, retry once with
    // neutral defaults filled into the missing args before reporting failure.
    if (
      data?.errors &&
      (INTERNAL_ERROR_RE.test(joinErrors(data.errors)) ||
        looksLikeStackFrame(joinErrors(data.errors)))
    ) {
      const defaulted = withNeutralDefaults(args, resolvedArgs);
      if (defaulted) {
        const retried = await runCall(defaulted);
        if (!retried?.errors) data = retried;
      }
    }

    if (data?.errors) {
      return buildNotFoundResult(joinErrors(data.errors), apiUrl, authHeaders);
    }
    return data?.data?.[erxesOperation] ?? null;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: `Could not run "${op?.operation}": ${message}`,
      instruction:
        'This is an internal system problem, not a mistake by you or the user. Do NOT silently retry the same call. Tell the user in plain words that this one step could not be completed, and either continue with the rest of the task or ask how they want to proceed.',
    };
  }
}

/**
 * Fetches all INPUT_OBJECT type definitions so graphqlTypeToZod can build real
 * Zod schemas for them instead of falling back to z.any().
 */
export async function fetchInputTypesMap(
  settings: ErxesToolSettings | null,
): Promise<Record<string, GqlArgDef[]>> {
  const apiUrl = settings?.erxesApiUrl || 'http://localhost:4000';
  const token = settings?.erxesApiToken || '';

  const query = `{
    __schema {
      types {
        name
        kind
        inputFields {
          name
          type { name kind ofType { name kind ofType { name kind ofType { name kind } } } }
        }
      }
    }
  }`;

  try {
    const response = await fetch(`${apiUrl}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: asBearer(token) } : {}),
      },
      body: JSON.stringify({ query }),
    });
    const data = (await response.json()) as {
      data?: { __schema?: { types?: IntrospectedNamedType[] } };
    };
    const types = data?.data?.__schema?.types || [];
    const map: Record<string, GqlArgDef[]> = {};
    for (const namedType of types) {
      if (namedType.kind === 'INPUT_OBJECT' && namedType.inputFields?.length) {
        map[namedType.name] = namedType.inputFields;
      }
    }
    return map;
  } catch {
    return {};
  }
}

// ─── Plugin ownership via live subgraph introspection ────────────────────────
//
// Source of truth for "which plugin owns this operation": introspect each
// ENABLED plugin's own subgraph (discovered through erxes service discovery)
// and record every Query/Mutation field it declares. This:
//   • only ever sees enabled/running plugins (disabled ones aren't registered),
//   • re-derives from the live schema on every call (auto-adapts to changes),
//   • needs no static prefix lists and no supergraph SDL access.
// (The gateway does not expose `{ _service { sdl } }`, so SDL parsing isn't an
// option here.)
async function fetchPluginMap(token: string): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const authHeaders: Record<string, string> = token
    ? { Authorization: asBearer(token) }
    : {};

  let plugins: string[] = [];
  try {
    plugins = await getPlugins(); // ['core', ...ENABLED_PLUGINS, ...only-api]
  } catch {
    return map;
  }

  await Promise.all(
    plugins.map(async (name) => {
      try {
        const address = await getPluginAddress(name);
        if (!address) return;

        const res = await fetch(`${address}/graphql`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({
            query:
              '{ __schema { queryType { fields { name } } mutationType { fields { name } } } }',
          }),
        });
        const json = (await res.json()) as {
          data?: {
            __schema?: {
              queryType?: { fields?: Array<{ name?: string }> | null };
              mutationType?: { fields?: Array<{ name?: string }> | null };
            };
          };
        };
        const schema = json?.data?.__schema;
        const fields = [
          ...(schema?.queryType?.fields || []),
          ...(schema?.mutationType?.fields || []),
        ];
        for (const field of fields) {
          // Skip federation internals (_service/_entities) and ClientPortal ops.
          // First subgraph to declare a field name wins.
          if (!field?.name || /^(_|cp[A-Z])/.test(field.name)) continue;
          if (!map.has(field.name)) map.set(field.name, name);
        }
      } catch {
        // Plugin unreachable — its ops just won't be categorized via this map.
      }
    }),
  );

  return map;
}

/**
 * Introspect all OBJECT types → their fields, so chooseResponseFields can build
 * a valid selection set for any return type (replacing the naive `_id name`).
 */
export async function fetchObjectFieldsMap(
  settings: ErxesToolSettings | null,
): Promise<Record<string, GqlFieldDef[]>> {
  const apiUrl = settings?.erxesApiUrl || 'http://localhost:4000';
  const token = settings?.erxesApiToken || '';

  const query = `{
    __schema {
      types {
        name
        kind
        fields {
          name
          type { kind name ofType { kind name ofType { kind name ofType { kind name } } } }
        }
      }
    }
  }`;

  try {
    const response = await fetch(`${apiUrl}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: asBearer(token) } : {}),
      },
      body: JSON.stringify({ query }),
    });
    const data = (await response.json()) as {
      data?: { __schema?: { types?: IntrospectedNamedType[] } };
    };
    const types = data?.data?.__schema?.types || [];
    const map: Record<string, GqlFieldDef[]> = {};
    for (const namedType of types) {
      if (
        namedType.kind === 'OBJECT' &&
        namedType.fields?.length &&
        !String(namedType.name).startsWith('__')
      ) {
        map[namedType.name] = namedType.fields;
      }
    }
    return map;
  } catch {
    return {};
  }
}

/**
 * Discovers every executable operation on the gateway (queries + mutations),
 * with plugin/module attribution and a model-readable description.
 */
export async function fetchAvailableErxesTools(
  settings: ErxesToolSettings | null,
): Promise<OperationMeta[]> {
  const apiUrl = settings?.erxesApiUrl || 'http://localhost:4000';
  const token = settings?.erxesApiToken || '';
  const authHeaders: Record<string, string> = token
    ? { Authorization: asBearer(token) }
    : {};

  // Resolve plugin ownership (per-subgraph introspection) and the full gateway
  // field list (for descriptions/args/types) in parallel.
  const [pluginMap, schemaRes] = await Promise.all([
    fetchPluginMap(token),
    fetch(`${apiUrl}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({
        query: `{
          __schema {
            queryType {
              fields {
                name description
                type { name kind ofType { name kind ofType { name kind } } }
                args {
                  name description
                  type { name kind ofType { name kind ofType { name kind ofType { name kind } } } }
                }
              }
            }
            mutationType {
              fields {
                name description
                type { name kind ofType { name kind ofType { name kind } } }
                args {
                  name description
                  type { name kind ofType { name kind ofType { name kind ofType { name kind } } } }
                }
              }
            }
          }
        }`,
      }),
    }),
  ]);

  if (!schemaRes.ok) {
    console.warn(
      `[mastra] gateway introspection failed: HTTP ${schemaRes.status}`,
    );
    return [];
  }

  let schemaData: {
    data?: {
      __schema?: {
        queryType?: { fields?: GqlFieldDef[] | null };
        mutationType?: { fields?: GqlFieldDef[] | null };
      };
    };
  };
  try {
    schemaData = await schemaRes.json();
  } catch {
    console.warn('[mastra] gateway introspection returned invalid JSON');
    return [];
  }
  const schema = schemaData?.data?.__schema;

  if (pluginMap.size === 0) {
    console.warn(
      '[mastra] _service { sdl } returned no data — falling back to first-word detection',
    );
  }

  const tools: OperationMeta[] = [];

  const SKIP_RE = /^(_|cp[A-Z])/;

  /** Maps gateway schema fields onto operation descriptors, skipping internals. */
  const processFields = (
    fields: GqlFieldDef[] | null | undefined,
    opType: 'query' | 'mutation',
  ) => {
    for (const field of fields || []) {
      // Always skip internal and ClientPortal operations
      if (SKIP_RE.test(field.name)) continue;

      const plugin = pluginMap.get(field.name) ?? detectPlugin(field.name);
      if (!plugin) continue;

      tools.push({
        plugin,
        module: deriveModule(field.name),
        operation: field.name,
        operationType: opType,
        description: field.description?.trim()
          ? truncateWords(field.description, 15)
          : humanizeOperation(field.name, opType),
        graphqlArgs: field.args || [],
        returnType: field.type,
      });
    }
  };

  processFields(schema?.queryType?.fields, 'query');
  processFields(schema?.mutationType?.fields, 'mutation');

  return tools;
}

// ─────────────────────────────────────────────────────────────────────────────

// Fallback when the SDL is unavailable: group by the first lowercase word of
// the camelCase operation name (e.g. "salesBoards" → "sales").
// Skips internal (_ prefix) and ClientPortal (cp + uppercase) operations.
function detectPlugin(operationName: string): string | null {
  if (!operationName) return null;
  if (operationName.startsWith('_')) return null;
  if (/^cp[A-Z]/.test(operationName)) return null;
  const match = operationName.match(/^([a-z]+)/);
  return match?.[1] || null;
}

import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getCurrentAuth } from '../requestContext';

function truncateWords(text: string, maxWords = 15): string {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  return words.length <= maxWords ? text : words.slice(0, maxWords).join(' ') + '...';
}

// LLMs often serialize array/object values as JSON strings when calling tools,
// and frequently use Python-style single quotes instead of standard JSON double
// quotes (e.g. "['id1','id2']" instead of ["id1","id2"]).  Both forms must be
// coerced back to the real type so Zod validation never rejects valid LLM output.
function parseJsonPreprocess(val: unknown): unknown {
  if (typeof val !== 'string') return val;
  // 1. Standard JSON — handles properly-quoted strings and arrays.
  try { return JSON.parse(val); } catch { /* fall through */ }
  // 2. Python-style single-quoted literals — only attempt when the value looks
  //    like a list or object so we don't mangle plain string scalars.
  const trimmed = val.trim();
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try { return JSON.parse(trimmed.replace(/'/g, '"')); } catch { /* keep as-is */ }
  }
  return val;
}

// Recursively reconstruct the GraphQL type string (e.g. "[String!]!") from the
// introspection type object so variable definitions in built operations are exact.
function graphqlTypeToString(type: any): string {
  if (!type) return 'String';
  if (type.kind === 'NON_NULL') return `${graphqlTypeToString(type.ofType)}!`;
  if (type.kind === 'LIST') return `[${graphqlTypeToString(type.ofType)}]`;
  return type.name || 'String';
}

// inputTypesMap: name → inputFields[], populated via fetchInputTypesMap().
// Passed through the Zod builders so INPUT_OBJECT types get real schemas
// instead of z.any(), giving the LLM correct field names up front.
function graphqlTypeToZod(type: any, inputTypesMap?: Record<string, any[]>): z.ZodTypeAny {
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
        if (lower === 'true'  || lower === '1' || lower === 'yes') return true;
        if (lower === 'false' || lower === '0' || lower === 'no')  return false;
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
        const d = new Date(trimmed);
        if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
        return undefined;
      }, z.string().optional());
    case 'JSON':
      return z.preprocess(parseJsonPreprocess, z.any().optional());
    default:
      return z.any().optional();
  }
}

function buildZodSchemaFromArgs(args: any[], inputTypesMap?: Record<string, any[]>): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const arg of args || []) {
    shape[arg.name] = graphqlTypeToZod(arg.type, inputTypesMap);
  }
  return z.object(shape);
}

function resolveReturnTypeKind(type: any): string {
  if (!type) return 'UNKNOWN';
  if (type.kind === 'NON_NULL' || type.kind === 'LIST') return resolveReturnTypeKind(type.ofType);
  return type.kind || 'UNKNOWN';
}

function needsSelectionSet(returnType: any): boolean {
  const kind = resolveReturnTypeKind(returnType);
  return kind !== 'SCALAR' && kind !== 'ENUM';
}

function resolveReturnTypeName(type: any): string {
  if (!type) return '';
  if (type.kind === 'NON_NULL' || type.kind === 'LIST') return resolveReturnTypeName(type.ofType);
  return type.name || '';
}

// Returns true when the value carries no meaningful data and should be omitted
// from the GraphQL operation rather than sent as an empty/noise variable.
// LLMs routinely fill optional args with "" / {} / [] as a "nothing here"
// placeholder; sending those to the API causes erxes to reject the request.
function isNoopValue(val: any): boolean {
  if (val === undefined || val === null) return true;
  if (typeof val === 'string' && val.trim() === '') return true;
  if (Array.isArray(val) && val.length === 0) return true;
  if (typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0) return true;
  return false;
}

function buildGraphqlOperation(
  operation: string,
  operationType: 'query' | 'mutation',
  args: any[],
  inputArgs: Record<string, any>,
  returnType?: any,
  responseFields?: string,
): { query: string; variables: Record<string, any> } {
  const provided = (args || []).filter((a: any) => !isNoopValue(inputArgs[a.name]));

  const varDefs = provided.map((a: any) => {
    return `$${a.name}: ${graphqlTypeToString(a.type)}`;
  }).join(', ');

  const argList = provided.map((a: any) => `${a.name}: $${a.name}`).join(', ');
  const variables: Record<string, any> = {};
  for (const a of provided) variables[a.name] = inputArgs[a.name];

  // Add a selection set for object return types; skip for scalars/enums.
  // When no explicit responseFields are configured, choose a sensible default:
  // - ListResponse wrapper types (e.g. SalesPipelinesListResponse) expose
  //   their items under a `list` field — select that with _id + name.
  // - Regular object / array types: select _id + name so the LLM can
  //   identify records by name, not just raw MongoDB IDs.
  let defaultFields = '_id name';
  if (!responseFields) {
    const rootTypeName = resolveReturnTypeName(returnType);
    if (rootTypeName.endsWith('ListResponse') || rootTypeName.endsWith('Connection')) {
      defaultFields = 'list { _id name } totalCount';
    }
  }
  const selection = needsSelectionSet(returnType) ? ` { ${responseFields || defaultFields} }` : '';

  const opStr = `${operation}${argList ? `(${argList})` : ''}${selection}`;
  const queryStr = operationType === 'mutation'
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

async function gqlCall(
  apiUrl: string,
  authHeaders: Record<string, string>,
  query: string,
): Promise<any> {
  try {
    const res = await fetch(`${apiUrl}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ query }),
    });
    return (await res.json())?.data ?? null;
  } catch {
    return null;
  }
}

// Returns a deduplicated list of { stageId, stageName } across all boards/pipelines.
// Only stageName is exposed to the LLM — the raw ObjectId is resolved internally.
async function resolveAvailableStages(
  apiUrl: string,
  authHeaders: Record<string, string>,
): Promise<any[]> {
  const boardsData = await gqlCall(apiUrl, authHeaders, '{ salesBoards { _id name } }');
  const boards: any[] = boardsData?.salesBoards ?? [];
  const seen = new Set<string>();
  const stages: any[] = [];

  for (const board of boards.slice(0, 5)) {
    const pipData = await gqlCall(
      apiUrl, authHeaders,
      `{ salesPipelines(boardId: "${board._id}") { list { _id name } } }`,
    );
    const pipelines: any[] = pipData?.salesPipelines?.list ?? [];

    for (const pipeline of pipelines.slice(0, 5)) {
      const stData = await gqlCall(
        apiUrl, authHeaders,
        `{ salesStages(pipelineId: "${pipeline._id}") { _id name } }`,
      );
      for (const stage of (stData?.salesStages ?? [])) {
        if (seen.has(stage._id)) continue;
        seen.add(stage._id);
        stages.push({ stageId: stage._id, stageName: stage.name });
      }
    }
  }
  return stages;
}

// Entity → auto-resolver function.  Add new entities here as needed.
type Resolver = (apiUrl: string, headers: Record<string, string>) => Promise<any[]>;
const ENTITY_RESOLVERS: Record<string, { key: string; resolver: Resolver }> = {
  stage: { key: 'availableStages', resolver: resolveAvailableStages },
};

async function buildNotFoundResult(
  rawMessage: string,
  apiUrl: string,
  authHeaders: Record<string, string>,
): Promise<Record<string, any>> {
  const lower = rawMessage.toLowerCase();
  for (const [entity, { key, resolver }] of Object.entries(ENTITY_RESOLVERS)) {
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
      const names = items.map((i: any) => i.stageName ?? i.name).filter(Boolean);
      return {
        success: false,
        availableStages: names,
        instruction: names.length
          ? `Call dealsAdd immediately with: { stageId: "${names[0]}", name: "deal name" }. Available stages: ${names.join(', ')}.`
          : `No ${entity}s found. Make sure the erxes sales plugin is configured and has at least one board with a pipeline and stage.`,
      };
    }
  }
  return { success: false, message: rawMessage };
}

export function buildErxesTool(toolConfig: any, settings: any, inputTypesMap?: Record<string, any[]>) {
  const { toolId, name, description, erxesOperation, erxesOperationType, graphqlArgs, erxesReturnType, erxesResponseFields } = toolConfig;

  const apiUrl = settings?.erxesApiUrl || 'http://localhost:4000';
  const token = settings?.erxesApiToken || '';
  const args = graphqlArgs || [];

  const inputSchema = buildZodSchemaFromArgs(args, inputTypesMap);

  return createTool({
    id: toolId,
    description: description || `Run erxes ${erxesOperationType} ${erxesOperation}`,
    inputSchema,
    outputSchema: z.any(),
    execute: async (inputArgs) => {
      // Auth must be resolved first — needed for any pre-flight stage lookups.
      const reqAuth = getCurrentAuth();
      const authHeaders: Record<string, string> = {};
      if (reqAuth?.userHeader) {
        authHeaders['user'] = reqAuth.userHeader;
      } else if (reqAuth?.token || token) {
        authHeaders['Authorization'] = reqAuth?.token || token;
      }

      // ── dealsAdd pre-flight ────────────────────────────────────────────────
      // LLMs naturally express intent with stage NAMES (e.g. "Test for Ai"),
      // not MongoDB ObjectIds.  This block auto-resolves any name sent as
      // stageId → real ObjectId transparently, so the LLM never has to know
      // or remember the raw database ID.
      let resolvedArgs: Record<string, any> = inputArgs as Record<string, any>;

      if (erxesOperation === 'dealsAdd') {
        // dealsAdd takes flat top-level args: dealsAdd(name, stageId, ...) — no doc wrapper.
        let stageId: string | undefined = resolvedArgs?.stageId;
        // Strip surrounding quotes LLMs sometimes add: '"Test for Ai"' → 'Test for Ai'
        if (typeof stageId === 'string') {
          stageId = stageId.replace(/^["']|["']$/g, '').trim();
        }

        const isValidObjectId = (s?: string) => !!s && /^[a-f0-9]{24}$/i.test(s);

        if (!isValidObjectId(stageId)) {
          const stages = await resolveAvailableStages(apiUrl, authHeaders);

          if (stageId) {
            // Fuzzy-match the name the LLM sent against real stage names.
            const needle = stageId.toLowerCase().trim();
            const match =
              stages.find((s: any) => (s.stageName || '').toLowerCase() === needle) ||
              stages.find((s: any) => (s.stageName || '').toLowerCase().includes(needle));
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
            const stageNames = stages.map((s: any) => s.stageName);
            return {
              success: false,
              availableStages: stageNames,
              instruction: stages.length
                ? `Call dealsAdd immediately with: { stageId: "${stageNames[0] ?? 'stage name'}", name: "deal name" }. Available stages: ${stageNames.join(', ')}.`
                : 'No stages exist. Tell the user to create a Board with a Pipeline and Stage in erxes Sales first.',
            };
          }
        }
      }
      // ──────────────────────────────────────────────────────────────────────

      // Build the GraphQL operation after stageId has been resolved.
      // For dealsAdd, also request stageId back so we can verify it was set.
      const finalResponseFields = erxesOperation === 'dealsAdd'
        ? '_id name stageId'
        : erxesResponseFields;

      const { query: finalQuery, variables: finalVariables } = buildGraphqlOperation(
        erxesOperation,
        erxesOperationType,
        args,
        resolvedArgs,
        erxesReturnType,
        finalResponseFields,
      );

      const response = await fetch(`${apiUrl}/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ query: finalQuery, variables: finalVariables }),
      });

      const data = await response.json() as any;

      if (erxesOperation === 'dealsAdd') {
        console.log('[dealsAdd] query:', finalQuery);
        console.log('[dealsAdd] variables:', JSON.stringify(finalVariables));
        console.log('[dealsAdd] response:', JSON.stringify(data));
      }

      if (data.errors) {
        const raw = data.errors.map((e: any) => e.message).join('; ');
        return buildNotFoundResult(raw, apiUrl, authHeaders);
      }
      return data?.data?.[erxesOperation] ?? null;
    },
  });
}

// Fetches all INPUT_OBJECT type definitions so graphqlTypeToZod can build real
// Zod schemas for them instead of falling back to z.any().
export async function fetchInputTypesMap(settings: any): Promise<Record<string, any[]>> {
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
        ...(token ? { Authorization: token } : {}),
      },
      body: JSON.stringify({ query }),
    });
    const data = await response.json() as any;
    const types: any[] = data?.data?.__schema?.types || [];
    const map: Record<string, any[]> = {};
    for (const t of types) {
      if (t.kind === 'INPUT_OBJECT' && t.inputFields?.length) {
        map[t.name] = t.inputFields;
      }
    }
    return map;
  } catch {
    return {};
  }
}

// ─── SDL-based plugin detection ──────────────────────────────────────────────
//
// Apollo Router exposes the full supergraph SDL via `{ _service { sdl } }`.
// The SDL contains `@join__field(graph: SERVICE)` on every Query/Mutation field,
// giving exact plugin ownership with zero guessing.

function parseSupergraphSDL(sdl: string): Map<string, string> {
  // 1. Build ENUM_VALUE → plugin-name from the join__Graph enum block.
  //    e.g.  SALES @join__graph(name: "sales", url: "http://...")
  const graphEnumMap = new Map<string, string>();
  const enumRegex = /\b([A-Z][A-Z0-9_]*)\s+@join__graph\(name:\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = enumRegex.exec(sdl)) !== null) {
    graphEnumMap.set(m[1], m[2].toLowerCase());
  }

  // 2. Walk the SDL line-by-line so we correctly handle fields whose argument
  //    list spans multiple lines.  A new field starts with exactly two leading
  //    spaces followed by an identifier.  The @join__field annotation may appear
  //    on the same line or a few lines later (after the closing ): ReturnType).
  const operationMap = new Map<string, string>();
  const lines = sdl.split('\n');
  let pendingField = '';

  for (const line of lines) {
    // New field at 2-space indent — capture its name.
    const fieldStart = line.match(/^  (\w+)\b/);
    if (fieldStart) {
      pendingField = fieldStart[1];
    }

    // @join__field annotation — attribute the pending field to its plugin.
    const annotMatch = line.match(/@join__field\(graph:\s*["']?([A-Za-z_][A-Za-z0-9_]*)["']?/);
    if (annotMatch && pendingField) {
      const ref = annotMatch[1];
      const plugin = graphEnumMap.get(ref) ?? ref.toLowerCase();
      operationMap.set(pendingField, plugin);
      pendingField = '';
    }

    // Closing brace resets state (we've left the field block).
    if (line.trim() === '}') pendingField = '';
  }

  return operationMap;
}

async function fetchPluginMap(apiUrl: string, token: string): Promise<Map<string, string>> {
  try {
    const res = await fetch(`${apiUrl}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: token } : {}),
      },
      body: JSON.stringify({ query: '{ _service { sdl } }' }),
    });
    const json = await res.json() as any;
    const sdl: string = json?.data?._service?.sdl || '';
    return sdl ? parseSupergraphSDL(sdl) : new Map();
  } catch {
    return new Map();
  }
}

export async function fetchAvailableErxesTools(settings: any): Promise<any[]> {
  const apiUrl = settings?.erxesApiUrl || 'http://localhost:4000';
  const token = settings?.erxesApiToken || '';
  const authHeaders: Record<string, string> = token ? { Authorization: token } : {};

  // Fetch SDL-based plugin map and full field list in parallel
  const [pluginMap, schemaRes] = await Promise.all([
    fetchPluginMap(apiUrl, token),
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

  const schemaData = await schemaRes.json() as any;
  const schema = schemaData?.data?.__schema;

  if (pluginMap.size === 0) {
    console.warn('[mastra] _service { sdl } returned no data — falling back to first-word detection');
  }

  const tools: any[] = [];

  const SKIP_RE = /^(_|cp[A-Z])/;

  const processFields = (fields: any[], opType: 'query' | 'mutation') => {
    for (const field of fields || []) {
      // Always skip internal and ClientPortal operations
      if (SKIP_RE.test(field.name)) continue;

      const plugin = pluginMap.get(field.name) ?? detectPlugin(field.name);
      if (!plugin) continue;

      tools.push({
        plugin,
        operation: field.name,
        operationType: opType,
        description: truncateWords(field.description || `${opType} ${field.name}`, 15),
        graphqlArgs: field.args || [],
        returnType: field.type,
      });
    }
  };

  processFields(schema?.queryType?.fields, 'query');
  processFields(schema?.mutationType?.fields, 'mutation');

  return tools;
}

// ─── Auto-create helpers ─────────────────────────────────────────────────────

function toToolId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function defaultResponseFields(returnType: any): string {
  const name = resolveReturnTypeName(returnType);
  if (name.endsWith('ListResponse') || name.endsWith('Connection')) {
    return 'list { _id name } totalCount';
  }
  return '_id name';
}

export interface AutoCreateResult {
  created: number;
  skipped: number;
  total: number;
}

/**
 * Discovers every erxes GraphQL operation via introspection and inserts a
 * MastraTool document for each one that doesn't already exist.
 *
 * ClientPortal operations (prefix "cp") are excluded by detectPlugin() since
 * none of the known plugin prefixes start with "cp".  An explicit guard is
 * also added for clarity.
 */
export async function autoCreateErxesTools(settings: any, models: any): Promise<AutoCreateResult> {
  const operations = await fetchAvailableErxesTools(settings);

  let created = 0;
  let skipped = 0;

  for (const op of operations) {
    // Explicit ClientPortal guard (cp* operations are already excluded by
    // detectPlugin, but we check here for clarity).
    if (op.operation.toLowerCase().startsWith('cp')) {
      skipped++;
      continue;
    }

    const toolId = toToolId(`${op.plugin}-${op.operation}`);

    const existing = await models.MastraTool.findOne({ toolId });
    if (existing) {
      skipped++;
      continue;
    }

    await models.MastraTool.create({
      toolId,
      name: op.operation,
      description: op.description || `${op.operationType} ${op.operation}`,
      type: 'erxes',
      erxesPlugin: op.plugin,
      erxesOperation: op.operation,
      erxesOperationType: op.operationType,
      graphqlArgs: op.graphqlArgs || [],
      erxesReturnType: op.returnType || null,
      erxesResponseFields: defaultResponseFields(op.returnType),
      isEnabled: true,
    });

    created++;
  }

  return { created, skipped, total: operations.length };
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

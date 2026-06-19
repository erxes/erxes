// ---------------------------------------------------------------------------
// Operation humanisation — pure name/verb → human-label heuristics.
//
// erxes' GraphQL schema carries no field descriptions, so operation names are
// all we have to go on. These helpers turn a camelCase operation name into a
// readable action phrase (for both the UI picker and the agent), derive a
// best-effort "module"/entity grouping, and provide the SDL-unavailable
// fallback for plugin attribution. All pure and table-driven — no I/O.
// ---------------------------------------------------------------------------

import { splitCamelWords } from '~/mastra/text';

/** Clip text to the first maxWords words, appending an ellipsis when cut. */
export function truncateWords(text: string, maxWords = 15): string {
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

// Fallback when the SDL is unavailable: group by the first lowercase word of
// the camelCase operation name (e.g. "salesBoards" → "sales").
// Skips internal (_ prefix) and ClientPortal (cp + uppercase) operations.
export function detectPlugin(operationName: string): string | null {
  if (!operationName) return null;
  if (operationName.startsWith('_')) return null;
  if (/^cp[A-Z]/.test(operationName)) return null;
  const match = operationName.match(/^([a-z]+)/);
  return match?.[1] || null;
}

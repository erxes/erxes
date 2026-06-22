/**
 * Reference resolution for workflow definitions.
 *
 * Definitions reference runtime data with `{{ ... }}` expressions:
 *   {{ trigger.payload.text }}        — trigger envelope
 *   {{ steps.classify.output.intent }} — a prior step's output
 *   {{ bindings.supportAgent }}        — a named binding's id
 *
 * Refs resolve DATA only, never structure: they cannot name operations,
 * policies, or step types, which is part of the injection-containment story
 * (docs/WORKFLOW-SPEC.md §8.5).
 */

export interface RefScope {
  trigger: Record<string, unknown>;
  steps: Record<string, { output: unknown }>;
  bindings: Record<string, { kind: string; id: string }>;
}

// Dot paths only — array elements via numeric segments (items.0.name), never
// bracket syntax: lookup() splits on '.', so `items[0]` would silently resolve
// undefined. findMalformedRefs surfaces such mistakes at authoring time.
export const REF_RE = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;
// A string that is exactly one ref (and nothing else) resolves to the raw
// value — object, array, number — instead of a string interpolation.
const WHOLE_REF_RE = /^\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}$/;

const ROOTS = ['trigger', 'steps', 'bindings'] as const;

/** Extracts every `{{ path }}` expression from a JSON value, recursively. */
export function collectRefs(value: unknown): string[] {
  const refs: string[] = [];
  /** Recursively gathers ref paths from strings, arrays, and objects. */
  const walk = (node: unknown) => {
    if (typeof node === 'string') {
      for (const match of node.matchAll(REF_RE)) refs.push(match[1]);
    } else if (Array.isArray(node)) {
      node.forEach(walk);
    } else if (node && typeof node === 'object') {
      Object.values(node).forEach(walk);
    }
  };
  walk(value);
  return refs;
}

/**
 * Strings that contain `{{` which the ref grammar didn't consume — bracket
 * indexing, spaces in paths, unclosed braces. Caught at validation so the
 * master agent gets an error instead of a silent runtime undefined.
 */
export function findMalformedRefs(value: unknown): string[] {
  const bad: string[] = [];
  /** Recursively flags strings whose `{{` was not consumed by the ref grammar. */
  const walk = (node: unknown) => {
    if (typeof node === 'string') {
      if (node.replace(REF_RE, '').includes('{{')) bad.push(node);
    } else if (Array.isArray(node)) {
      node.forEach(walk);
    } else if (node && typeof node === 'object') {
      Object.values(node).forEach(walk);
    }
  };
  walk(value);
  return bad;
}

/**
 * Compile-time shape check of one ref path. `priorStepIds` are the steps that
 * execute before the referencing step — referencing a later (or unknown) step
 * is an authoring error surfaced by validateDefinition.
 */
export function checkRef(
  path: string,
  priorStepIds: Set<string>,
  bindingKeys: Set<string>,
): string | null {
  const segs = path.split('.');
  const root = segs[0] as (typeof ROOTS)[number];
  if (!ROOTS.includes(root)) {
    return `unknown ref root "${segs[0]}" (expected trigger | steps | bindings)`;
  }
  if (root === 'steps') {
    const stepId = segs[1];
    if (!stepId) return `ref "${path}" is missing a step id`;
    if (!priorStepIds.has(stepId)) {
      return `ref "${path}" points at step "${stepId}" which does not execute before it`;
    }
    if (segs[2] !== 'output') {
      return `ref "${path}" must read a step's output (steps.${stepId}.output.*)`;
    }
  }
  if (root === 'bindings') {
    const key = segs[1];
    if (!key) return `ref "${path}" is missing a binding key`;
    if (!bindingKeys.has(key))
      return `ref "${path}" names an unknown binding "${key}"`;
  }
  return null;
}

/**
 * Walks one dot path through the scope, returning undefined on any dead end.
 * The public path-resolution primitive: evalExpr resolves an already-parsed
 * ref through this directly, and resolveValue uses it for `{{ }}` strings.
 */
export function lookup(path: string, scope: RefScope): unknown {
  const segs = path.split('.');
  let cur: unknown = scope;
  for (const seg of segs) {
    if (cur === null || cur === undefined) return undefined;
    cur = (cur as Record<string, unknown>)[seg];
  }
  // A binding reference resolves to the bound id — definitions stay portable
  // because the tenant-local id lives in the bindings map, not inline.
  if (segs[0] === 'bindings' && cur && typeof cur === 'object' && 'id' in cur) {
    return cur.id;
  }
  return cur;
}

/** Resolves every ref in a JSON value against the runtime scope, recursively. */
export function resolveValue(value: unknown, scope: RefScope): unknown {
  if (typeof value === 'string') {
    const whole = value.match(WHOLE_REF_RE);
    if (whole) return lookup(whole[1], scope);
    return value.replace(REF_RE, (_: string, path: string) => {
      const resolved = lookup(path, scope);
      return resolved === undefined || resolved === null
        ? ''
        : String(resolved);
    });
  }
  if (Array.isArray(value)) {
    return value.map((item) => resolveValue(item, scope));
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      out[key] = resolveValue(entry, scope);
    }
    return out;
  }
  return value;
}

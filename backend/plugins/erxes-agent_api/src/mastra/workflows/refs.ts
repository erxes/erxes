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
  trigger: Record<string, any>;
  steps: Record<string, { output: any }>;
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
export function collectRefs(value: any): string[] {
  const refs: string[] = [];
  const walk = (v: any) => {
    if (typeof v === 'string') {
      for (const m of v.matchAll(REF_RE)) refs.push(m[1]);
    } else if (Array.isArray(v)) {
      v.forEach(walk);
    } else if (v && typeof v === 'object') {
      Object.values(v).forEach(walk);
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
export function findMalformedRefs(value: any): string[] {
  const bad: string[] = [];
  const walk = (v: any) => {
    if (typeof v === 'string') {
      if (v.replace(REF_RE, '').includes('{{')) bad.push(v);
    } else if (Array.isArray(v)) {
      v.forEach(walk);
    } else if (v && typeof v === 'object') {
      Object.values(v).forEach(walk);
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

function lookup(path: string, scope: RefScope): any {
  const segs = path.split('.');
  let cur: any = scope;
  for (const seg of segs) {
    if (cur === null || cur === undefined) return undefined;
    cur = cur[seg];
  }
  // A binding reference resolves to the bound id — definitions stay portable
  // because the tenant-local id lives in the bindings map, not inline.
  if (segs[0] === 'bindings' && cur && typeof cur === 'object' && 'id' in cur) {
    return cur.id;
  }
  return cur;
}

/** Resolves every ref in a JSON value against the runtime scope, recursively. */
export function resolveValue(value: any, scope: RefScope): any {
  if (typeof value === 'string') {
    const whole = value.match(WHOLE_REF_RE);
    if (whole) return lookup(whole[1], scope);
    return value.replace(REF_RE, (_, path) => {
      const v = lookup(path, scope);
      return v === undefined || v === null ? '' : String(v);
    });
  }
  if (Array.isArray(value)) return value.map((v) => resolveValue(v, scope));
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) out[k] = resolveValue(v, scope);
    return out;
  }
  return value;
}

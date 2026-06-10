import { z } from 'zod';
import { collectRefs, checkRef } from './refs';
import type { OperationRegistry } from '../tools/operationRegistry';
import { isOperationAllowed, ToolPolicy } from '../tools/scope';

/**
 * The workflow definition DSL — the declarative JSON document the master agent
 * authors and the compiler turns into a Mastra workflow graph. The LLM writes
 * DATA, never code (docs/WORKFLOW-SPEC.md §3).
 *
 * The schema covers the full kernel step set (§4.3). The compiler currently
 * supports the linear subset (COMPILED_STEP_TYPES); validateDefinition rejects
 * definitions using steps the compiler can't execute yet, so a saved
 * definition is always a runnable one.
 */

const stepIdSchema = z
  .string()
  .regex(
    /^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/,
    'step id must start with a letter and contain only letters, digits, _ or -',
  );

// Agent-step output fields: 'string' | 'number' | 'boolean' (optional with a
// trailing '?') or 'enum:a,b,c'. Enums are how judgment feeds deterministic
// branches — classification is LLM, routing is code (§4.5).
const FIELD_SPEC_RE = /^(string|number|boolean|enum:[a-zA-Z0-9_,-]+)\??$/;
const fieldSpecSchema = z.string().regex(FIELD_SPEC_RE, {
  message: "field spec must be string|number|boolean|enum:a,b,c (optionally suffixed '?')",
});

export const operationStepSchema = z.object({
  id: stepIdSchema,
  type: z.literal('operation'),
  operation: z.string().min(1),
  args: z.record(z.any()).default({}),
});

export const agentStepSchema = z.object({
  id: stepIdSchema,
  type: z.literal('agent'),
  // Named binding (kind 'agent') — never a raw tenant id, so definitions stay
  // portable as templates (§11.6).
  agentRef: z.string().min(1),
  prompt: z.string().min(1),
  outputSchema: z.record(fieldSpecSchema),
});

export const waitStepSchema = z.object({
  id: stepIdSchema,
  type: z.literal('wait'),
  // Milliseconds; bounded to 30 days.
  duration: z.number().int().min(1).max(30 * 24 * 60 * 60 * 1000),
});

export const endStepSchema = z.object({
  id: stepIdSchema,
  type: z.literal('end'),
  output: z.any().optional(),
});

// Declared but not yet compilable — kept in the schema so drafts can be
// round-tripped and error messages stay precise ("not supported yet" beats
// "invalid").
const futureStepSchema = z.object({
  id: stepIdSchema,
  type: z.enum(['branch', 'parallel', 'foreach', 'loop', 'approval', 'input', 'workflow']),
}).passthrough();

export const stepSchema = z.union([
  operationStepSchema,
  agentStepSchema,
  waitStepSchema,
  endStepSchema,
  futureStepSchema,
]);

export type WorkflowStep = z.infer<typeof stepSchema>;

export const COMPILED_STEP_TYPES = new Set(['operation', 'agent', 'wait', 'end']);

export const workflowTriggerSchema = z.object({
  type: z.enum(['manual', 'automation', 'schedule', 'webhook', 'workflow']),
  // Source-specific narrowing, e.g. { triggerType: 'frontline:facebook.messages' }
  // for automation, { cron: '0 3 * * *' } for schedule.
  config: z.record(z.any()).default({}),
});

export const workflowPolicySchema = z.object({
  mode: z.enum(['all', 'custom']),
  allowed: z.array(z.string()).default([]),
});

export const bindingSchema = z.object({
  kind: z.enum(['agent', 'workflow']),
  id: z.string().min(1),
});

export const workflowLimitsSchema = z.object({
  maxLlmCalls: z.number().int().min(1).max(50).default(10),
});

export const MAX_STEPS = 30;

export const workflowDefinitionSchema = z.object({
  trigger: workflowTriggerSchema,
  policy: workflowPolicySchema,
  bindings: z.record(bindingSchema).default({}),
  limits: workflowLimitsSchema.default({ maxLlmCalls: 10 }),
  steps: z.array(stepSchema).min(1).max(MAX_STEPS),
});

export type WorkflowDefinition = z.infer<typeof workflowDefinitionSchema>;

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: ValidationIssue[];
  definition?: WorkflowDefinition;
}

/**
 * Full authoring-time validation: schema shape, unique ids, ref integrity
 * (only prior steps / known bindings / the trigger), compiler support, and —
 * when a live operation registry is provided — operation existence and policy
 * coverage. Returns structured errors the master agent iterates on.
 */
export function validateDefinition(
  raw: any,
  registry?: OperationRegistry,
): ValidationResult {
  const parsed = workflowDefinitionSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      })),
    };
  }

  const def = parsed.data;
  const errors: ValidationIssue[] = [];
  const bindingKeys = new Set(Object.keys(def.bindings));
  const seen = new Set<string>();
  const prior = new Set<string>();

  def.steps.forEach((step, idx) => {
    const at = `steps.${idx} (${step.id})`;

    if (seen.has(step.id)) errors.push({ path: at, message: `duplicate step id "${step.id}"` });
    seen.add(step.id);

    if (!COMPILED_STEP_TYPES.has(step.type)) {
      errors.push({
        path: at,
        message: `step type "${step.type}" is not supported by the compiler yet`,
      });
    }

    if (step.type === 'end' && idx !== def.steps.length - 1) {
      errors.push({ path: at, message: 'an "end" step must be the last step' });
    }

    // Ref integrity — refs may only read the trigger, PRIOR step outputs, or
    // declared bindings.
    for (const ref of collectRefs(step)) {
      const problem = checkRef(ref, prior, bindingKeys);
      if (problem) errors.push({ path: at, message: problem });
    }

    if (step.type === 'agent') {
      const binding = def.bindings[(step as any).agentRef];
      if (!binding) {
        errors.push({
          path: at,
          message: `agentRef "${(step as any).agentRef}" has no entry in bindings`,
        });
      } else if (binding.kind !== 'agent') {
        errors.push({
          path: at,
          message: `binding "${(step as any).agentRef}" is kind "${binding.kind}", expected "agent"`,
        });
      }
    }

    if (step.type === 'operation') {
      const opName = (step as any).operation as string;
      if (registry) {
        const meta = registry.operations.get(opName);
        if (!meta) {
          errors.push({ path: at, message: `operation "${opName}" does not exist on this instance` });
        } else if (!isOperationAllowed(meta, def.policy as ToolPolicy)) {
          errors.push({
            path: at,
            message: `operation "${opName}" is outside this workflow's policy`,
          });
        }
      } else if (def.policy.mode === 'custom') {
        // No registry (offline validation): exact-name policy check only.
        const direct = def.policy.allowed.includes(opName);
        const grouped = def.policy.allowed.some(
          (e) => e.startsWith('plugin:') || e.startsWith('module:'),
        );
        if (!direct && !grouped) {
          errors.push({
            path: at,
            message: `operation "${opName}" is outside this workflow's policy`,
          });
        }
      }
    }

    prior.add(step.id);
  });

  return errors.length ? { ok: false, errors } : { ok: true, errors: [], definition: def };
}

/** Builds the zod validator for an agent step's declared output fields. */
export function buildOutputZod(spec: Record<string, string>): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const [key, raw] of Object.entries(spec)) {
    const optional = raw.endsWith('?');
    const base = optional ? raw.slice(0, -1) : raw;
    let t: z.ZodTypeAny;
    if (base === 'string') t = z.string();
    else if (base === 'number') t = z.number();
    else if (base === 'boolean') t = z.boolean();
    else {
      const values = base.slice('enum:'.length).split(',').filter(Boolean);
      t = z.enum(values as [string, ...string[]]);
    }
    shape[key] = optional ? t.optional() : t;
  }
  return z.object(shape);
}

import { z } from 'zod';
import { ExpectedError } from 'erxes-api-shared/utils';
import { collectRefs, checkRef, findMalformedRefs } from './refs';
import { parseExpr, exprRefs } from './expr';
import type { OperationRegistry } from '../tools/operationRegistry';
import { isOperationAllowed, ToolPolicy } from '../tools/scope';
import { isDestructiveOperation } from '../tools/destructiveGuard';

/**
 * The workflow definition DSL — the declarative JSON document the master agent
 * authors and the compiler turns into a Mastra workflow graph. The LLM writes
 * DATA, never code (docs/WORKFLOW-SPEC.md §3).
 *
 * The schema covers the full kernel step set (§4.3). The compiler currently
 * supports operation/agent/wait/end plus branch (first-match semantics with
 * nested sequential steps) and parallel (single-step fan-out); validateDefinition
 * rejects definitions using steps the compiler can't execute yet, so a saved
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
const FIELD_SPEC_RE =
  /^(string|number|boolean|enum:[a-zA-Z0-9_-]+(?:,[a-zA-Z0-9_-]+)*)\??$/;
const fieldSpecSchema = z.string().regex(FIELD_SPEC_RE, {
  message:
    "field spec must be string|number|boolean|enum:a,b,c (optionally suffixed '?')",
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
  duration: z
    .number()
    .int()
    .min(1)
    .max(30 * 24 * 60 * 60 * 1000),
});

export const endStepSchema = z.object({
  id: stepIdSchema,
  type: z.literal('end'),
  output: z.any().optional(),
});

// Steps allowed inside branch arms and parallel fan-outs. Containers don't
// nest in v1 (one level of branching keeps definitions auditable), and `end`
// is top-level-only.
const innerStepSchema = z.union([
  operationStepSchema,
  agentStepSchema,
  waitStepSchema,
]);

export const branchStepSchema = z.object({
  id: stepIdSchema,
  type: z.literal('branch'),
  // First-match semantics (if / else-if / else) — the compiler makes the
  // conditions mutually exclusive before handing them to Mastra (whose native
  // .branch runs EVERY matching arm).
  branches: z
    .array(
      z.object({
        when: z.string().min(1),
        steps: z.array(innerStepSchema).min(1),
      }),
    )
    .min(1),
  else: z.array(innerStepSchema).optional(),
});

export const parallelStepSchema = z.object({
  id: stepIdSchema,
  type: z.literal('parallel'),
  // Effect steps only — `wait` is a chain-level pause and cannot fan out.
  steps: z.array(z.union([operationStepSchema, agentStepSchema])).min(2),
});

/**
 * The single source of truth for "what is runnable". Every step type maps to
 * either 'compiled' (the compiler builds + runs it) or 'planned' (schema'd so
 * drafts round-trip and errors stay precise, but validateDefinition rejects it
 * as "not supported yet" and the compiler never dispatches it).
 *
 * 'wait' is 'planned' on purpose: it is schema'd and the compiler can emit a
 * chain.sleep, but a sleeping run parks in Mastra storage and nothing resumes
 * it yet — that worker is the Phase 3 suspend/resume deliverable. Enabling it
 * now would silently abandon runs, so validation rejects a wait step before it
 * ever reaches the compiler.
 */
export const STEP_SUPPORT = {
  operation: 'compiled',
  agent: 'compiled',
  end: 'compiled',
  branch: 'compiled',
  parallel: 'compiled',
  wait: 'planned',
  foreach: 'planned',
  loop: 'planned',
  approval: 'planned',
  input: 'planned',
  workflow: 'planned',
} as const satisfies Record<string, 'compiled' | 'planned'>;

export type StepSupportType = keyof typeof STEP_SUPPORT;

/** True when the compiler can build and run a step of this type. */
export function isCompiledStep(type: string): boolean {
  return STEP_SUPPORT[type as StepSupportType] === 'compiled';
}

// The 'planned' types that still need a placeholder schema so drafts using
// them round-trip and produce a precise "not supported yet" error instead of a
// blunt "invalid". 'wait' has its own full schema (waitStepSchema) above.
const PLANNED_DRAFT_TYPES = (
  Object.keys(STEP_SUPPORT) as StepSupportType[]
).filter((type) => STEP_SUPPORT[type] === 'planned' && type !== 'wait') as [
  'foreach',
  'loop',
  'approval',
  'input',
  'workflow',
];

// Declared but not yet compilable — kept in the schema so drafts can be
// round-tripped and error messages stay precise ("not supported yet" beats
// "invalid").
const futureStepSchema = z
  .object({
    id: stepIdSchema,
    type: z.enum(PLANNED_DRAFT_TYPES),
  })
  .passthrough();

export const stepSchema = z.union([
  operationStepSchema,
  agentStepSchema,
  waitStepSchema,
  endStepSchema,
  branchStepSchema,
  parallelStepSchema,
  futureStepSchema,
]);

export type WorkflowStep = z.infer<typeof stepSchema>;

// Back-compat alias over STEP_SUPPORT — the set of types the compiler runs.
export const COMPILED_STEP_TYPES = new Set(
  (Object.keys(STEP_SUPPORT) as StepSupportType[]).filter(isCompiledStep),
);

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
  // Consent for irreversible deletes/merges, mirroring the chat agent's
  // destructiveOps. Defaults to 'block': a workflow with a remove/delete/merge
  // step must explicitly opt in with 'allow' or validation rejects it.
  destructiveOps: z.enum(['allow', 'block']).default('block'),
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

/** Total step count of a step list, including steps nested in containers. */
function countSteps(steps: WorkflowStep[]): number {
  let n = 0;
  for (const step of steps) {
    n += 1;
    if (step?.type === 'branch') {
      for (const arm of step.branches || []) n += countSteps(arm.steps || []);
      n += countSteps(step.else || []);
    }
    if (step?.type === 'parallel') n += countSteps(step.steps || []);
  }
  return n;
}

type SchemaCheck =
  | { ok: true; def: WorkflowDefinition }
  | { ok: false; errors: ValidationIssue[] };

/** Schema-shape pass: parses raw into a typed definition or schema errors. */
function checkSchema(raw: unknown): SchemaCheck {
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
  return { ok: true, def: parsed.data };
}

/** Step-cap pass: the count includes steps nested in containers. */
function checkStepCap(def: WorkflowDefinition): ValidationIssue[] {
  if (countSteps(def.steps) > MAX_STEPS) {
    return [
      {
        path: 'steps',
        message: `definition exceeds the ${MAX_STEPS}-step cap (nested steps count)`,
      },
    ];
  }
  return [];
}

/** Cron pass: a schedule trigger needs a 5- or 6-field cron expression. */
function checkCron(def: WorkflowDefinition): ValidationIssue[] {
  if (def.trigger.type !== 'schedule') return [];
  const cron: unknown = def.trigger.config?.cron;
  if (
    typeof cron !== 'string' ||
    !/^\S+\s+\S+\s+\S+\s+\S+\s+\S+(\s+\S+)?$/.test(cron.trim())
  ) {
    return [
      {
        path: 'trigger.config.cron',
        message:
          'schedule trigger requires config.cron — a 5- or 6-field cron expression (UTC)',
      },
    ];
  }
  return [];
}

/** `end` is top-level-only and must be the last step. */
function checkEndPosition(def: WorkflowDefinition): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  def.steps.forEach((step, idx) => {
    if (step.type === 'end' && idx !== def.steps.length - 1) {
      issues.push({
        path: `steps.${idx} (${step.id})`,
        message: 'an "end" step must be the last step',
      });
    }
  });
  return issues;
}

/** Shared state threaded through the stateful ref/binding walk. */
interface WalkContext {
  def: WorkflowDefinition;
  registry?: OperationRegistry;
  bindingKeys: Set<string>;
  allIds: Set<string>;
  issues: ValidationIssue[];
}

/** Validates one effect step's refs, agent binding, and operation/policy. */
function checkLeaf(
  ctx: WalkContext,
  step: WorkflowStep,
  at: string,
  prior: Set<string>,
): void {
  const { def, registry, bindingKeys, issues } = ctx;
  for (const ref of collectRefs(step)) {
    const problem = checkRef(ref, prior, bindingKeys);
    if (problem) issues.push({ path: at, message: problem });
  }
  for (const bad of findMalformedRefs(step)) {
    issues.push({
      path: at,
      message: `malformed reference in "${bad}" — use dot paths only, e.g. {{steps.list.output.items.0.name}}`,
    });
  }

  if (step.type === 'agent') {
    const binding = def.bindings[step.agentRef];
    if (!binding) {
      issues.push({
        path: at,
        message: `agentRef "${step.agentRef}" has no entry in bindings`,
      });
    } else if (binding.kind !== 'agent') {
      issues.push({
        path: at,
        message: `binding "${step.agentRef}" is kind "${binding.kind}", expected "agent"`,
      });
    }
  }

  if (step.type === 'operation') {
    const opName = step.operation as string;
    if (registry) {
      const meta = registry.operations.get(opName);
      if (!meta) {
        issues.push({
          path: at,
          message: `operation "${opName}" does not exist on this instance`,
        });
      } else if (!isOperationAllowed(meta, def.policy as ToolPolicy)) {
        issues.push({
          path: at,
          message: `operation "${opName}" is outside this workflow's policy`,
        });
      } else if (
        isDestructiveOperation(meta) &&
        def.destructiveOps !== 'allow'
      ) {
        issues.push({
          path: at,
          message: `operation "${opName}" deletes or merges data; set "destructiveOps": "allow" on the workflow to permit it`,
        });
      }
    } else if (def.policy.mode === 'custom') {
      // No registry (offline validation): exact-name policy check only.
      const direct = def.policy.allowed.includes(opName);
      const grouped = def.policy.allowed.some(
        (e) => e.startsWith('plugin:') || e.startsWith('module:'),
      );
      if (!direct && !grouped) {
        issues.push({
          path: at,
          message: `operation "${opName}" is outside this workflow's policy`,
        });
      }
    }
  }
}

/** Records a step id, flagging duplicates across all nesting levels. */
function claimId(ctx: WalkContext, id: string, at: string): void {
  if (ctx.allIds.has(id))
    ctx.issues.push({ path: at, message: `duplicate step id "${id}"` });
  ctx.allIds.add(id);
}

/**
 * Sequential walk of one step list, accumulating issues into ctx. `prior` is
 * what these steps may reference; returns the ids this list contributes.
 * Lifted to module scope (taking ctx) instead of closing over validator locals.
 */
function walkSequence(
  ctx: WalkContext,
  steps: WorkflowStep[],
  prior: Set<string>,
  basePath: string,
): string[] {
  const { bindingKeys, issues } = ctx;
  const contributed: string[] = [];

  steps.forEach((step, idx) => {
    const at = `${basePath}.${idx} (${step.id})`;
    claimId(ctx, step.id, at);

    if (!isCompiledStep(step.type)) {
      issues.push({
        path: at,
        message: `step type "${step.type}" is not supported by the compiler yet`,
      });
      return;
    }

    if (step.type === 'branch') {
      // Conditions must parse, and may only reference what exists BEFORE
      // the branch.
      const checkCondition = (when: string, condAt: string) => {
        try {
          const ast = parseExpr(when);
          for (const ref of exprRefs(ast)) {
            const problem = checkRef(ref, prior, bindingKeys);
            if (problem) issues.push({ path: condAt, message: problem });
          }
        } catch (e) {
          issues.push({
            path: condAt,
            message: e?.message || 'condition failed to parse',
          });
        }
      };

      const innerIds: string[] = [];
      step.branches.forEach((arm, bi) => {
        checkCondition(arm.when, `${at}.branches.${bi}.when`);
        // Each arm sees the outer prior; arms are mutually exclusive so
        // they never see each other.
        innerIds.push(
          ...walkSequence(
            ctx,
            arm.steps,
            new Set(prior),
            `${at}.branches.${bi}.steps`,
          ),
        );
      });
      if (step.else) {
        innerIds.push(
          ...walkSequence(ctx, step.else, new Set(prior), `${at}.else`),
        );
      }
      // Steps AFTER the branch may reference arm outputs — the untaken
      // arm's refs simply resolve to undefined at runtime.
      innerIds.forEach((id) => prior.add(id));
      prior.add(step.id);
      contributed.push(step.id, ...innerIds);
      return;
    }

    if (step.type === 'parallel') {
      // Siblings run concurrently and must not reference each other.
      const innerIds: string[] = [];
      step.steps.forEach((member, si) => {
        const sAt = `${at}.steps.${si} (${member.id})`;
        claimId(ctx, member.id, sAt);
        checkLeaf(ctx, member, sAt, prior);
        innerIds.push(member.id);
      });
      innerIds.forEach((id) => prior.add(id));
      prior.add(step.id);
      contributed.push(step.id, ...innerIds);
      return;
    }

    checkLeaf(ctx, step, at, prior);
    prior.add(step.id);
    contributed.push(step.id);
  });

  return contributed;
}

/**
 * Ref/binding/compiler-support pass — the stateful walk: unique ids across
 * nesting, ref integrity (only prior steps / known bindings / the trigger),
 * condition parsability, compiler support, and operation existence/policy.
 */
function checkRefsAndBindings(
  def: WorkflowDefinition,
  registry?: OperationRegistry,
): ValidationIssue[] {
  const ctx: WalkContext = {
    def,
    registry,
    bindingKeys: new Set(Object.keys(def.bindings)),
    allIds: new Set<string>(),
    issues: [],
  };
  walkSequence(ctx, def.steps, new Set<string>(), 'steps');
  return ctx.issues;
}

/**
 * Full authoring-time validation: schema shape, unique ids (across nesting),
 * ref integrity (only prior steps / known bindings / the trigger), condition
 * parsability, compiler support, and — when a live operation registry is
 * provided — operation existence and policy coverage. Returns structured
 * errors the master agent iterates on.
 *
 * Composes the named passes below; PUBLIC signature + result shape are stable.
 */
export function validateDefinition(
  raw: unknown,
  registry?: OperationRegistry,
): ValidationResult {
  const schema = checkSchema(raw);
  if (!schema.ok) return { ok: false, errors: schema.errors };

  const def = schema.def;
  const errors: ValidationIssue[] = [
    ...checkStepCap(def),
    ...checkCron(def),
    ...checkEndPosition(def),
    ...checkRefsAndBindings(def, registry),
  ];

  return errors.length
    ? { ok: false, errors }
    : { ok: true, errors: [], definition: def };
}

/** Builds the zod validator for an agent step's declared output fields. */
export function buildOutputZod(
  spec: Record<string, string>,
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const [key, raw] of Object.entries(spec)) {
    const optional = raw.endsWith('?');
    const base = optional ? raw.slice(0, -1) : raw;
    let fieldType: z.ZodTypeAny;
    if (base === 'string') fieldType = z.string();
    else if (base === 'number') fieldType = z.number();
    else if (base === 'boolean') fieldType = z.boolean();
    else {
      const values = base
        .slice('enum:'.length)
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
      if (!values.length) {
        throw new ExpectedError(
          `output field '${key}': enum spec '${raw}' must include at least one value`,
        );
      }
      fieldType = z.enum(values as [string, ...string[]]);
    }
    shape[key] = optional ? fieldType.optional() : fieldType;
  }
  return z.object(shape);
}

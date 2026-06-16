import { z } from 'zod';
import { createTool } from '@mastra/core/tools';
import { getCurrentAuth } from '../requestContext';
import {
  validateDefinition,
  WorkflowDefinition,
  WorkflowStep,
} from '../workflows/dsl';
import {
  compileDefinition,
  CompiledDeps,
  finalOutput,
} from '../workflows/compiler';
import { buildManualEnvelope } from '../workflows/envelope';
import { runWorkflow } from '../workflows/runtime';
import { getOperationRegistry } from './operationRegistry';

/**
 * Builder tools — what turns a chat agent into the workflow MASTER AGENT
 * (docs/WORKFLOW-SPEC.md §5). The loop they enable, entirely in conversation:
 *
 *   workflowGuide → search_erxes_operations → workflowValidate (iterate on
 *   structured errors) → workflowSimulate (dry trace) → workflowSave →
 *   workflowRunNow / workflowRuns.
 *
 * They are ordinary builtins: bound by default (`policy.mode === 'all'`),
 * deniable per agent via the existing `builtin:<key>` allowlist grammar.
 */

/** A created Mastra tool — the same erased registry type builtins.ts uses. */
type MastraTool = ReturnType<typeof createTool>;

/** Config shape this module passes to the loosely-typed createTool alias. */
interface WorkflowToolConfig {
  id: string;
  description: string;
  inputSchema: z.ZodTypeAny;
  outputSchema: z.ZodTypeAny;
  // Method syntax (bivariant) so each tool can declare its own input shape.
  execute(input: never): Promise<unknown>;
}

/** One step record in a workflowSimulate dry-run trace. */
interface SimulationTraceEvent {
  step: 'operation' | 'agent';
  operation?: string;
  args?: Record<string, unknown>;
  stepId?: string;
  prompt?: string;
  output?: Record<string, unknown>;
  assumed?: boolean;
}

// Loosely-typed alias: createTool's full generic inference over this file's
// many tool configs is deliberately skipped (it OOM'd the type-checker);
// runtime behavior is identical.
const tool = createTool as unknown as (cfg: WorkflowToolConfig) => MastraTool;

/** Tenant of the current request (falls back to the non-saas 'os' tenant). */
const tenant = () => getCurrentAuth()?.subdomain || 'os';

/**
 * TEAM MEMBERS ONLY. The frontline bot webhook runs agents for ANONYMOUS
 * customers under the privileged app token (runWithAuth carries `token` but no
 * `userHeader`). Without this gate, a Facebook/IG customer could prompt the
 * bot into building, reading, or RUNNING workflows with admin privilege.
 * Every builder tool calls this first; the thrown message is surfaced to the
 * model so it answers honestly instead of retrying.
 */
const requireTeamMember = () => {
  if (!getCurrentAuth()?.userHeader) {
    throw new Error(
      'Workflow tools are only available to logged-in team members — not in this conversation.',
    );
  }
};

/** The tenant's plugin models, loaded lazily per call. */
async function getModels() {
  // Lazy dynamic import keeps connectionResolvers (mongoose models +
  // erxes-api-shared — the whole plugin's module graph) out of this file's
  // load-time imports; jest mocks it and production loads it on first use.
  const { generateModels } = await import('../../connectionResolvers');
  return generateModels(tenant());
}

/** The requesting user's _id, decoded from the propagated user header. */
function currentUserId(): string | undefined {
  const header = getCurrentAuth()?.userHeader;
  if (!header) return undefined;
  try {
    return JSON.parse(Buffer.from(header, 'base64').toString())._id;
  } catch {
    return undefined;
  }
}

/** Normalizes a thrown value into the tools' { success: false, error } shape. */
const fail = (e: unknown) => ({
  success: false as const,
  error: (e as { message?: string } | null | undefined)?.message || String(e),
});

// ─────────────────────────────────────────────────────────────────────────────

const GUIDE = `# Workflow definition format (read fully before drafting)

A workflow is a JSON document:
{
  "trigger": { "type": "manual" | "automation" | "schedule" | "webhook", "config": {} },
  "policy": { "mode": "all" | "custom", "allowed": ["dealsAdd", "plugin:sales", "module:customers"] },
  "destructiveOps": "block" | "allow",
  "bindings": { "<name>": { "kind": "agent", "id": "<agent _id>" } },
  "limits": { "maxLlmCalls": 10 },
  "steps": [ ... ]
}

STEP TYPES (max 30 steps total, ids unique, letters/digits/_/-):
- { "id", "type": "operation", "operation": "<exact erxes operation name>", "args": { ... } }
  Runs one erxes operation. Discover names/args with search_erxes_operations.
- { "id", "type": "agent", "agentRef": "<bindings key>", "prompt": "...", "outputSchema": { "field": "string|number|boolean|enum:a,b,c" } }
  One LLM judgment call. Append '?' for optional fields. Use an enum field for
  anything a branch will route on.
- { "id", "type": "branch", "branches": [{ "when": "<condition>", "steps": [...] }], "else": [...] }
  First matching arm runs (if / else-if / else). Arms contain operation/agent
  steps only (no nesting). Branch output: { "taken": "<arm>" }.
- { "id", "type": "parallel", "steps": [<operation/agent steps>] }  — all run concurrently.
- { "id", "type": "end", "output": { ... } }  — optional, must be last; declares the run's final output.
(wait / approval / input / foreach / loop / workflow steps are planned but NOT supported yet — never use them.)

DATA REFERENCES — inside args / prompt / output / conditions:
- {{trigger.payload.<field>}}   — the trigger's payload (manual run input, event document)
- {{steps.<id>.output.<field>}} — a PRIOR step's output (untaken branch arms resolve undefined)
- {{bindings.<name>}}           — resolves to the bound id
Dot paths ONLY — array elements by numeric segment ({{steps.find.output.list.0._id}});
bracket syntax like items[0] is rejected. A string that is exactly one reference
passes the raw value (objects/numbers); references embedded in text interpolate
as strings.

CONDITIONS ("when") — restricted language, nothing else parses:
  refs, 'string', numbers, true/false/null, == != > < >= <= && || ! in, parentheses
  Example: "{{steps.classify.output.intent}} == 'order' && {{trigger.payload.amount}} > 1000"
Never put customer text in conditions — classify with an agent step's enum, branch on the enum.

TRIGGERS:
- "manual" — run on demand from chat (workflowRunNow) or the UI.
- "schedule" — config: { "cron": "0 9 * * *" } (UTC, 5- or 6-field). Fires
  automatically while the workflow is enabled; takes effect within ~5 minutes.
- "automation" — fires when an erxes Automation includes the "Run agent
  workflow" action pointing at this workflow. The user must wire the trigger
  (new conversation, ticket created, segment entry, ...) to that action in the
  erxes Automations UI — tell them this step is theirs.
- "webhook" — NOT available yet, never use it.

RULES:
1. Always set the narrowest policy that covers every operation step.
2. Bind agents through "bindings" — never inline agent ids in steps.
3. Destructive operations (*Remove, *Delete, *Merge): a step using one is
   REJECTED by validation unless the workflow sets "destructiveOps": "allow"
   (default "block"). Only set "allow" when the user has explicitly asked to
   delete or merge records — warn them and get confirmation before saving, and
   prefer editing or archiving over removing. Payment creation also warrants an
   explicit warning even though it is not gated here.
4. Build flow: validate with workflowValidate and fix every error. Then:
   - If the user ALREADY asked you to create/save the workflow (or already
     confirmed a plan), call workflowSave NOW, in this SAME turn. Do not
     re-ask, do not stop to report that validation passed.
   - Only when the user has NOT yet approved anything: simulate with
     workflowSimulate, present the step list in plain language, and ask for
     confirmation — then save immediately on their yes.
   Never end a turn after a successful validation without either saving or
   asking the one confirmation question. A validated-but-unsaved workflow
   does not exist for the user.`;

export const workflowGuideTool = tool({
  id: 'workflow-guide',
  description:
    'Returns the workflow definition format reference (step types, data references, condition language, rules). ALWAYS call this before drafting or editing a workflow definition.',
  inputSchema: z.object({}),
  outputSchema: z.object({ guide: z.string() }),
  execute: () => {
    requireTeamMember();
    return Promise.resolve({ guide: GUIDE });
  },
});

export const workflowValidateTool = tool({
  id: 'workflow-validate',
  description:
    'Validates a draft workflow definition against the schema AND the live erxes operation registry (operation existence, policy coverage, reference integrity, condition syntax). Returns structured errors to fix — iterate until ok=true before saving.',
  inputSchema: z.object({
    definition: z.record(z.any()).describe('The full workflow definition JSON'),
  }),
  outputSchema: z.object({
    ok: z.boolean(),
    errors: z.array(z.object({ path: z.string(), message: z.string() })),
    instruction: z.string().optional(),
  }),
  execute: async ({ definition }: { definition: Record<string, unknown> }) => {
    requireTeamMember();
    const models = await getModels();
    const settings = await models.MastraSettings.getSettings();
    const registry = await getOperationRegistry(settings);
    const result = validateDefinition(definition, registry);
    return {
      ok: result.ok,
      errors: result.errors,
      // Validation is preparation, not the result — without this nudge models
      // routinely end the turn here and the workflow never gets created.
      instruction: result.ok
        ? 'Validation passed. If the user already asked you to create/save this workflow (or confirmed a plan), call workflowSave NOW in this same turn. Otherwise present the plan in plain language and ask for confirmation.'
        : 'Fix every error above and validate again before saving.',
    };
  },
});

export const workflowSimulateTool = tool({
  id: 'workflow-simulate',
  description:
    'Dry-runs a workflow definition WITHOUT touching erxes data or calling any LLM: operations return stubs, agent steps return your assumptions (or auto-samples). Returns the step-by-step trace — use it to show the user what the workflow will do, and to test branch routing by varying assumptions.',
  inputSchema: z.object({
    definition: z.record(z.any()),
    triggerPayload: z
      .record(z.any())
      .default({})
      .describe('Simulated trigger payload'),
    assumptions: z
      .record(z.record(z.any()))
      .optional()
      .describe(
        'Assumed agent-step outputs keyed by step id, e.g. {"classify": {"intent": "order"}}. May be PARTIAL — unspecified required fields are auto-filled with samples.',
      ),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    status: z.string().optional(),
    trace: z.array(z.any()).optional(),
    output: z.any().optional(),
    errors: z.any().optional(),
    error: z.string().optional(),
  }),
  execute: async ({
    definition,
    triggerPayload,
    assumptions,
  }: {
    definition: Record<string, unknown>;
    triggerPayload?: Record<string, unknown>;
    assumptions?: Record<string, Record<string, unknown>>;
  }) => {
    requireTeamMember();
    try {
      const models = await getModels();
      const settings = await models.MastraSettings.getSettings();
      const registry = await getOperationRegistry(settings);
      const check = validateDefinition(definition, registry);
      if (!check.ok || !check.definition) {
        return { success: false, errors: check.errors };
      }

      const def = check.definition;
      const trace: SimulationTraceEvent[] = [];

      /** Auto-fills one agent output spec with type-appropriate sample values. */
      const sampleFor = (spec: Record<string, string>) => {
        const out: Record<string, unknown> = {};
        for (const [field, raw] of Object.entries(spec)) {
          if (raw.endsWith('?')) continue;
          if (raw.startsWith('enum:')) out[field] = raw.slice(5).split(',')[0];
          else if (raw === 'number') out[field] = 0;
          else if (raw === 'boolean') out[field] = false;
          else out[field] = 'sample';
        }
        return out;
      };

      /** Finds a step by id anywhere in the tree (branch arms, parallel members). */
      const findAgentStep = (
        steps: WorkflowStep[],
        id: string,
      ): WorkflowStep | null => {
        for (const s of steps) {
          if (s.id === id) return s;
          if (s.type === 'branch') {
            for (const b of s.branches) {
              const hit = findAgentStep(b.steps, id);
              if (hit) return hit;
            }
            if (s.else) {
              const hit = findAgentStep(s.else, id);
              if (hit) return hit;
            }
          }
          if (s.type === 'parallel') {
            const hit = findAgentStep(s.steps, id);
            if (hit) return hit;
          }
        }
        return null;
      };

      const deps: CompiledDeps = {
        executeOperation: (operation, args) => {
          trace.push({ step: 'operation', operation, args });
          return Promise.resolve({ simulated: true, operation });
        },
        runJudgment: ({ prompt, outputSpec }) => {
          // Match the judgment back to its step id via the resolved prompt's
          // origin — assumptions are keyed by step id, so locate the agent
          // step whose outputSpec matches this call.
          for (const [stepId, assumed] of Object.entries(assumptions || {})) {
            const step = findAgentStep(def.steps, stepId);
            if (
              step &&
              step.type === 'agent' &&
              step.outputSchema === outputSpec
            ) {
              // Assumptions are usually PARTIAL (just the routing field) —
              // merge them over auto-sampled defaults so the remaining
              // required fields don't fail the step's schema validation.
              const output = {
                ...sampleFor(outputSpec),
                ...assumed,
              };
              trace.push({
                step: 'agent',
                stepId,
                prompt,
                output,
                assumed: true,
              });
              return Promise.resolve(output);
            }
          }
          const sampled = sampleFor(outputSpec);
          trace.push({
            step: 'agent',
            prompt,
            output: sampled,
            assumed: false,
          });
          return Promise.resolve(sampled);
        },
      };

      const wf = compileDefinition('simulation', def, deps);
      const run = wf.createRunAsync
        ? await wf.createRunAsync()
        : await wf.createRun();
      const result = await run.start({
        inputData: {
          trigger: buildManualEnvelope(triggerPayload || {}, 'simulation'),
          steps: {},
        },
      });

      return {
        success: result.status === 'success',
        status: result.status,
        trace,
        output:
          result.status === 'success'
            ? finalOutput(def, result.result)
            : undefined,
        error:
          result.status === 'failed'
            ? String(result.error?.message || result.error)
            : undefined,
      };
    } catch (e) {
      return fail(e);
    }
  },
});

export const workflowSaveTool = tool({
  id: 'workflow-save',
  description:
    'Saves a NEW workflow after the user explicitly confirmed the presented step list. Validates first; returns the saved workflow id. Workflows are saved DISABLED unless enable=true.',
  inputSchema: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    definition: z.record(z.any()),
    enable: z.boolean().default(false),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    workflowId: z.string().optional(),
    version: z.number().optional(),
    errors: z.any().optional(),
    error: z.string().optional(),
  }),
  execute: async ({
    name,
    description,
    definition,
    enable,
  }: {
    name: string;
    description?: string;
    definition: Record<string, unknown>;
    enable?: boolean;
  }) => {
    requireTeamMember();
    try {
      const models = await getModels();
      const settings = await models.MastraSettings.getSettings();
      const registry = await getOperationRegistry(settings);
      const check = validateDefinition(definition, registry);
      if (!check.ok || !check.definition) {
        return { success: false, errors: check.errors };
      }

      const doc = await models.MastraWorkflow.createWorkflow({
        name,
        description,
        definition: check.definition,
        isEnabled: Boolean(enable),
        createdByUserId: currentUserId(),
      });
      return { success: true, workflowId: doc._id, version: doc.version };
    } catch (e) {
      return fail(e);
    }
  },
});

export const workflowUpdateTool = tool({
  id: 'workflow-update',
  description:
    'Updates an existing workflow (name, description, definition, enabled flag) after the user confirmed the change. Definition edits create a new version; in-flight runs keep their pinned version.',
  inputSchema: z.object({
    workflowId: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
    definition: z.record(z.any()).optional(),
    enable: z.boolean().optional(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    version: z.number().optional(),
    errors: z.any().optional(),
    error: z.string().optional(),
  }),
  execute: async ({
    workflowId,
    name,
    description,
    definition,
    enable,
  }: {
    workflowId: string;
    name?: string;
    description?: string;
    definition?: Record<string, unknown>;
    enable?: boolean;
  }) => {
    requireTeamMember();
    try {
      const models = await getModels();
      if (definition) {
        const settings = await models.MastraSettings.getSettings();
        const registry = await getOperationRegistry(settings);
        const check = validateDefinition(definition, registry);
        if (!check.ok) return { success: false, errors: check.errors };
      }
      const patch: {
        name?: string;
        description?: string;
        definition?: WorkflowDefinition;
        isEnabled?: boolean;
      } = {};
      if (name !== undefined) patch.name = name;
      if (description !== undefined) patch.description = description;
      if (definition !== undefined) {
        // Validated above whenever provided — safe to treat as a definition.
        patch.definition = definition as unknown as WorkflowDefinition;
      }
      if (enable !== undefined) patch.isEnabled = enable;
      const doc = await models.MastraWorkflow.updateWorkflow(workflowId, patch);
      return { success: true, version: doc.version };
    } catch (e) {
      return fail(e);
    }
  },
});

export const workflowListTool = tool({
  id: 'workflow-list',
  description:
    "Lists the tenant's saved workflows (id, name, version, enabled, trigger type).",
  inputSchema: z.object({}),
  outputSchema: z.object({ workflows: z.array(z.any()) }),
  execute: async () => {
    requireTeamMember();
    const models = await getModels();
    const docs = await models.MastraWorkflow.getWorkflows();
    return {
      workflows: docs.map((doc) => ({
        _id: doc._id,
        name: doc.name,
        description: doc.description,
        version: doc.version,
        isEnabled: doc.isEnabled,
        triggerType: doc.definition?.trigger?.type,
      })),
    };
  },
});

export const workflowRunsTool = tool({
  id: 'workflow-runs',
  description:
    'Lists recent runs of a workflow (status, per-step results, errors, LLM usage) — use to answer "why did my workflow do X?".',
  inputSchema: z.object({
    workflowId: z.string(),
    limit: z.number().int().min(1).max(20).default(5),
  }),
  outputSchema: z.object({ runs: z.array(z.any()) }),
  execute: async ({
    workflowId,
    limit,
  }: {
    workflowId: string;
    limit?: number;
  }) => {
    requireTeamMember();
    const models = await getModels();
    const docs = await models.MastraWorkflowRun.getRuns({
      workflowId,
      perPage: limit ?? 5,
    });
    return {
      runs: docs.map((run) => ({
        _id: run._id,
        status: run.status,
        version: run.version,
        stepsSummary: run.stepsSummary,
        output: run.output,
        error: run.error,
        usage: run.usage,
        startedAt: run.startedAt,
        finishedAt: run.finishedAt,
      })),
    };
  },
});

export const workflowRunNowTool = tool({
  id: 'workflow-run-now',
  description:
    'Runs a SAVED workflow immediately with a manual trigger payload. This executes REAL erxes operations — only call after the user explicitly asked to run it.',
  inputSchema: z.object({
    workflowId: z.string(),
    payload: z
      .record(z.any())
      .default({})
      .describe('Becomes {{trigger.payload.*}}'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    status: z.string().optional(),
    output: z.any().optional(),
    stepsSummary: z.any().optional(),
    error: z.string().optional(),
  }),
  execute: async ({
    workflowId,
    payload,
  }: {
    workflowId: string;
    payload?: Record<string, unknown>;
  }) => {
    requireTeamMember();
    try {
      const models = await getModels();
      const workflow = await models.MastraWorkflow.getWorkflow(workflowId);
      const record = await runWorkflow({
        models,
        subdomain: tenant(),
        workflow,
        envelope: buildManualEnvelope(payload || {}, currentUserId()),
      });
      return {
        success: record.status === 'success',
        status: record.status,
        output: record.output,
        stepsSummary: record.stepsSummary,
        error: record.error,
      };
    } catch (e) {
      return fail(e);
    }
  },
});

export const WORKFLOW_BUILTIN_TOOLS: Record<string, MastraTool> = {
  workflowGuide: workflowGuideTool,
  workflowValidate: workflowValidateTool,
  workflowSimulate: workflowSimulateTool,
  workflowSave: workflowSaveTool,
  workflowUpdate: workflowUpdateTool,
  workflowList: workflowListTool,
  workflowRuns: workflowRunsTool,
  workflowRunNow: workflowRunNowTool,
};

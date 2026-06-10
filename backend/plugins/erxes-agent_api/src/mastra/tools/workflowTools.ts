import { z } from 'zod';
import { getCurrentAuth } from '../requestContext';
import { validateDefinition, WorkflowDefinition } from '../workflows/dsl';
import { compileDefinition, CompiledDeps, finalOutput } from '../workflows/compiler';
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

// require(), not a static import: @mastra/core's .d.ts graph plus createTool's
// generic inference OOMs ts-jest's worker type-checking this file. The untyped
// alias skips both; runtime behavior is identical.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tool: (cfg: any) => any = require('@mastra/core/tools').createTool;

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

async function getModels() {
  // Lazy require keeps connectionResolvers (mongoose models + erxes-api-shared
  // types — the whole plugin's type graph) out of this file's static imports;
  // ts-jest OOMs its worker type-checking that chain.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { generateModels } = require('../../connectionResolvers');
  return generateModels(tenant());
}

function currentUserId(): string | undefined {
  const header = getCurrentAuth()?.userHeader;
  if (!header) return undefined;
  try {
    return JSON.parse(Buffer.from(header, 'base64').toString())._id;
  } catch {
    return undefined;
  }
}

const fail = (e: any) => ({ success: false as const, error: e?.message || String(e) });

// ─────────────────────────────────────────────────────────────────────────────

const GUIDE = `# Workflow definition format (read fully before drafting)

A workflow is a JSON document:
{
  "trigger": { "type": "manual" | "automation" | "schedule" | "webhook", "config": {} },
  "policy": { "mode": "all" | "custom", "allowed": ["dealsAdd", "plugin:sales", "module:customers"] },
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
3. Destructive operations (*Remove, *Delete, *Merge, payment creation): warn the
   user explicitly before saving, and get their confirmation.
4. Workflow: validate with workflowValidate, fix every error, simulate with
   workflowSimulate, present the step list in plain language, get explicit user
   confirmation, only then workflowSave.`;

export const workflowGuideTool = tool({
  id: 'workflow-guide',
  description:
    'Returns the workflow definition format reference (step types, data references, condition language, rules). ALWAYS call this before drafting or editing a workflow definition.',
  inputSchema: z.object({}),
  outputSchema: z.object({ guide: z.string() }),
  execute: async () => {
    requireTeamMember();
    return { guide: GUIDE };
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
  }),
  execute: async ({ definition }) => {
    requireTeamMember();
    const models = await getModels();
    const settings = await models.MastraSettings.getSettings();
    const registry = await getOperationRegistry(settings);
    const result = validateDefinition(definition, registry);
    return { ok: result.ok, errors: result.errors };
  },
});

export const workflowSimulateTool = tool({
  id: 'workflow-simulate',
  description:
    'Dry-runs a workflow definition WITHOUT touching erxes data or calling any LLM: operations return stubs, agent steps return your assumptions (or auto-samples). Returns the step-by-step trace — use it to show the user what the workflow will do, and to test branch routing by varying assumptions.',
  inputSchema: z.object({
    definition: z.record(z.any()),
    triggerPayload: z.record(z.any()).default({}).describe('Simulated trigger payload'),
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
  execute: async ({ definition, triggerPayload, assumptions }) => {
    requireTeamMember();
    try {
      const models = await getModels();
      const settings = await models.MastraSettings.getSettings();
      const registry = await getOperationRegistry(settings);
      const check = validateDefinition(definition, registry);
      if (!check.ok) return { success: false, errors: check.errors };

      const def = check.definition as WorkflowDefinition;
      const trace: any[] = [];

      const sampleFor = (spec: Record<string, string>) => {
        const out: Record<string, any> = {};
        for (const [field, raw] of Object.entries(spec)) {
          if (raw.endsWith('?')) continue;
          if (raw.startsWith('enum:')) out[field] = raw.slice(5).split(',')[0];
          else if (raw === 'number') out[field] = 0;
          else if (raw === 'boolean') out[field] = false;
          else out[field] = 'sample';
        }
        return out;
      };

      const findAgentStep = (steps: any[], id: string): any => {
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
        executeOperation: async (operation, args) => {
          trace.push({ step: 'operation', operation, args });
          return { simulated: true, operation };
        },
        runJudgment: async ({ prompt, outputSpec }) => {
          // Match the judgment back to its step id via the resolved prompt's
          // origin — assumptions are keyed by step id, so locate the agent
          // step whose outputSpec matches this call.
          for (const [stepId, assumed] of Object.entries(assumptions || {})) {
            const step = findAgentStep(def.steps as any[], stepId);
            if (step && step.outputSchema === outputSpec) {
              // Assumptions are usually PARTIAL (just the routing field) —
              // merge them over auto-sampled defaults so the remaining
              // required fields don't fail the step's schema validation.
              const output = { ...sampleFor(outputSpec), ...(assumed as object) };
              trace.push({ step: 'agent', stepId, prompt, output, assumed: true });
              return output;
            }
          }
          const sampled = sampleFor(outputSpec);
          trace.push({ step: 'agent', prompt, output: sampled, assumed: false });
          return sampled;
        },
      };

      const wf: any = compileDefinition('simulation', def, deps);
      const run = wf.createRunAsync ? await wf.createRunAsync() : await wf.createRun();
      const result = await run.start({
        inputData: { trigger: buildManualEnvelope(triggerPayload || {}, 'simulation'), steps: {} },
      });

      return {
        success: result.status === 'success',
        status: result.status,
        trace,
        output: result.status === 'success' ? finalOutput(def, result.result) : undefined,
        error:
          result.status === 'failed'
            ? String(result.error?.message || result.error)
            : undefined,
      };
    } catch (e: any) {
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
  execute: async ({ name, description, definition, enable }) => {
    requireTeamMember();
    try {
      const models = await getModels();
      const settings = await models.MastraSettings.getSettings();
      const registry = await getOperationRegistry(settings);
      const check = validateDefinition(definition, registry);
      if (!check.ok) return { success: false, errors: check.errors };

      const doc = await models.MastraWorkflow.createWorkflow({
        name,
        description,
        definition: check.definition!,
        isEnabled: Boolean(enable),
        createdByUserId: currentUserId(),
      });
      return { success: true, workflowId: doc._id, version: doc.version };
    } catch (e: any) {
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
  execute: async ({ workflowId, name, description, definition, enable }) => {
    requireTeamMember();
    try {
      const models = await getModels();
      if (definition) {
        const settings = await models.MastraSettings.getSettings();
        const registry = await getOperationRegistry(settings);
        const check = validateDefinition(definition, registry);
        if (!check.ok) return { success: false, errors: check.errors };
      }
      const patch: Record<string, any> = {};
      if (name !== undefined) patch.name = name;
      if (description !== undefined) patch.description = description;
      if (definition !== undefined) patch.definition = definition;
      if (enable !== undefined) patch.isEnabled = enable;
      const doc = await models.MastraWorkflow.updateWorkflow(workflowId, patch);
      return { success: true, version: doc.version };
    } catch (e: any) {
      return fail(e);
    }
  },
});

export const workflowListTool = tool({
  id: 'workflow-list',
  description: "Lists the tenant's saved workflows (id, name, version, enabled, trigger type).",
  inputSchema: z.object({}),
  outputSchema: z.object({ workflows: z.array(z.any()) }),
  execute: async () => {
    requireTeamMember();
    const models = await getModels();
    const docs = await models.MastraWorkflow.getWorkflows();
    return {
      workflows: docs.map((d: any) => ({
        _id: d._id,
        name: d.name,
        description: d.description,
        version: d.version,
        isEnabled: d.isEnabled,
        triggerType: d.definition?.trigger?.type,
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
  execute: async ({ workflowId, limit }) => {
    requireTeamMember();
    const models = await getModels();
    const docs = await models.MastraWorkflowRun.getRuns({ workflowId, perPage: limit ?? 5 });
    return {
      runs: docs.map((r: any) => ({
        _id: r._id,
        status: r.status,
        version: r.version,
        stepsSummary: r.stepsSummary,
        output: r.output,
        error: r.error,
        usage: r.usage,
        startedAt: r.startedAt,
        finishedAt: r.finishedAt,
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
    payload: z.record(z.any()).default({}).describe('Becomes {{trigger.payload.*}}'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    status: z.string().optional(),
    output: z.any().optional(),
    stepsSummary: z.any().optional(),
    error: z.string().optional(),
  }),
  execute: async ({ workflowId, payload }) => {
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
    } catch (e: any) {
      return fail(e);
    }
  },
});

export const WORKFLOW_BUILTIN_TOOLS: Record<string, any> = {
  workflowGuide: workflowGuideTool,
  workflowValidate: workflowValidateTool,
  workflowSimulate: workflowSimulateTool,
  workflowSave: workflowSaveTool,
  workflowUpdate: workflowUpdateTool,
  workflowList: workflowListTool,
  workflowRuns: workflowRunsTool,
  workflowRunNow: workflowRunNowTool,
};

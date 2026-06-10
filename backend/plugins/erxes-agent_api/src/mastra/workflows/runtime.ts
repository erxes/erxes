import { compileDefinition, CompiledDeps, finalOutput } from './compiler';
import { TriggerEnvelope } from './envelope';
import { WorkflowDefinition } from './dsl';
import { isOperationAllowed, ToolPolicy } from '../tools/scope';
import { getOperationRegistry } from '../tools/operationRegistry';
import type { IMastraWorkflowDocument, IMastraWorkflowRunDocument } from '@/workflow/@types/workflow';

type Env = Record<string, string | undefined>;

/**
 * Tenant canonicalization for workflow runtime state — same convention as the
 * knowledge index: saas uses the org subdomain, non-saas pins 'os' because the
 * request-derived label varies with hostname while background triggers have no
 * request at all.
 */
export function workflowTenant(
  requestSubdomain: string | undefined,
  env: Env = process.env,
): string {
  if ((env.VERSION || '').trim() === 'saas') return requestSubdomain || 'os';
  return 'os';
}

/**
 * Snapshot storage lives in a DEDICATED database, never the erxes one: the
 * @mastra/mongodb adapter auto-creates collections named mastra_threads,
 * mastra_messages, mastra_agents — identical to this plugin's own collections
 * (verified live; docs/WORKFLOW-SPEC.md §7).
 */
export function workflowDbName(tenant: string, env: Env = process.env): string {
  const prefix = (env.ERXES_AGENT_WORKFLOW_DB_PREFIX || 'erxes_mastra_runtime').trim();
  return `${prefix}_${tenant}`.replace(/[^a-zA-Z0-9_]/g, '_');
}

const storageCache = new Map<string, any>();

async function getWorkflowStorage(tenant: string): Promise<any> {
  const dbName = workflowDbName(tenant);
  const hit = storageCache.get(dbName);
  if (hit) return hit;

  // require(), not import() — see the loader-deadlock note in compiler.ts.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MongoDBStore } = require('@mastra/mongodb');
  const storage = new MongoDBStore({
    id: `erxes-agent-workflows-${tenant}`,
    uri: process.env.MONGO_URL || 'mongodb://localhost:27017',
    dbName,
  });
  storageCache.set(dbName, storage);
  return storage;
}

/** Pulls the first JSON object out of a model reply (tolerates ```json fences). */
export function extractJsonObject(text: string): Record<string, any> {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end <= start) {
    throw new Error('judgment reply contained no JSON object');
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

function judgmentInstruction(outputSpec: Record<string, string>): string {
  const fields = Object.entries(outputSpec)
    .map(([k, v]) => `  "${k}": ${v}`)
    .join('\n');
  return (
    'You are one step inside an automated workflow. Respond with ONLY a JSON object ' +
    '(no prose, no markdown) with exactly these fields:\n{\n' +
    fields +
    '\n}\n' +
    "Field spec legend: a trailing '?' means optional; 'enum:a,b,c' means the value " +
    'MUST be one of the listed options, verbatim.'
  );
}

/**
 * Builds the two effect handlers a compiled workflow needs, bound to this
 * run's models/settings and metered against the definition's limits.
 *
 * - executeOperation re-checks the workflow policy at execution time (defense
 *   in depth — same double-check as the chat meta-tools), then runs the op
 *   through the shared executor with the workflow's auth principal.
 * - runJudgment runs one structured LLM call on the bound agent, counting
 *   against limits.maxLlmCalls.
 */
export async function buildRunDeps(
  models: any,
  definition: WorkflowDefinition,
): Promise<{ deps: CompiledDeps; usage: { llmCalls: number } }> {
  const settings = await models.MastraSettings.getSettings();
  const registry = await getOperationRegistry(settings);
  const usage = { llmCalls: 0 };
  const maxLlmCalls = definition.limits?.maxLlmCalls ?? 10;

  const deps: CompiledDeps = {
    executeOperation: async (operation, args) => {
      const meta = registry.operations.get(operation);
      if (!meta) {
        throw new Error(`operation "${operation}" does not exist on this instance`);
      }
      if (!isOperationAllowed(meta, definition.policy as ToolPolicy)) {
        throw new Error(`operation "${operation}" is outside this workflow's policy`);
      }
      const { executeErxesOperation } = await import('../tools/erxesTools');
      return executeErxesOperation(
        meta,
        args || {},
        settings,
        registry.inputTypesMap,
        registry.objectFieldsMap,
      );
    },

    runJudgment: async ({ agentBindingId, prompt, outputSpec }) => {
      if (usage.llmCalls >= maxLlmCalls) {
        throw new Error(
          `workflow exceeded its LLM call limit (${maxLlmCalls}) — raise limits.maxLlmCalls if intentional`,
        );
      }
      usage.llmCalls += 1;

      const agentConfig = await models.MastraAgent.getAgent(agentBindingId);
      const [{ getOrCreateAgent }, { isLegacyProvider }] = await Promise.all([
        import('../agentRuntime'),
        import('../providers'),
      ]);
      const { agent } = await getOrCreateAgent(agentConfig, models);
      const providers = await models.MastraProvider.find({ isEnabled: true });
      const legacy = isLegacyProvider(agentConfig.provider, providers);

      const convo = [
        { role: 'system', content: judgmentInstruction(outputSpec) },
        { role: 'user', content: prompt },
      ];
      const res: any = legacy
        ? await (agent as any).generateLegacy(convo)
        : await (agent as any).generate(convo);
      return extractJsonObject(String(res?.text ?? ''));
    },
  };

  return { deps, usage };
}

function summarizeSteps(resultSteps: any): Record<string, { status: string; error?: string }> {
  const summary: Record<string, { status: string; error?: string }> = {};
  for (const [id, s] of Object.entries<any>(resultSteps || {})) {
    summary[id] = {
      status: s?.status || 'unknown',
      ...(s?.error ? { error: String(s.error?.message || s.error) } : {}),
    };
  }
  return summary;
}

/**
 * Runs one workflow document against a trigger envelope, end to end:
 * compile (per run — effect handlers close over this run's models/limits) →
 * fresh Mastra instance over the tenant's snapshot storage → start → persist
 * a MastraWorkflowRun record either way.
 *
 * The run record pins `version` and freezes `definitionSnapshot`, so later
 * edits never affect it (§11.3).
 */
export async function runWorkflow(args: {
  models: any;
  subdomain: string;
  workflow: IMastraWorkflowDocument;
  envelope: TriggerEnvelope;
}): Promise<IMastraWorkflowRunDocument> {
  const { models, subdomain, workflow, envelope } = args;
  const definition = workflow.definition as WorkflowDefinition;
  const tenant = workflowTenant(subdomain);
  const key = `wf_${workflow._id}_v${workflow.version}`;

  const { deps, usage } = await buildRunDeps(models, definition);
  // NOT awaited — the Workflow object is a thenable (see compiler.ts).
  const compiled = compileDefinition(key, definition, deps);

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Mastra } = require('@mastra/core/mastra');
  const storage = await getWorkflowStorage(tenant);
  // A fresh instance per run is deliberate: the compiled graph closes over
  // run-scoped effect handlers, and resume-by-runId from a fresh instance is
  // the verified durability model (docs/WORKFLOW-SPEC.md §7).
  const mastra = new Mastra({
    workflows: { [key]: compiled },
    storage,
    logger: false as any,
  });

  const wf = mastra.getWorkflow(key);
  const run: any = (wf as any).createRunAsync
    ? await (wf as any).createRunAsync()
    : await (wf as any).createRun();

  const record = await models.MastraWorkflowRun.createRun({
    workflowId: workflow._id,
    version: workflow.version,
    runId: run.runId,
    status: 'running',
    triggerEnvelope: envelope,
    definitionSnapshot: definition,
    startedAt: new Date(),
  });

  try {
    const result: any = await run.start({
      inputData: { trigger: envelope, steps: {} },
    });

    const status =
      result.status === 'success' || result.status === 'suspended' || result.status === 'canceled'
        ? result.status
        : 'failed';

    return models.MastraWorkflowRun.finishRun(record._id, {
      status,
      stepsSummary: summarizeSteps(result.steps),
      output: status === 'success' ? finalOutput(definition, result.result) : undefined,
      error:
        status === 'failed'
          ? String(result.error?.message || result.error || 'workflow failed')
          : undefined,
      usage,
      finishedAt: status === 'suspended' ? undefined : new Date(),
    });
  } catch (e: any) {
    return models.MastraWorkflowRun.finishRun(record._id, {
      status: 'failed',
      error: e?.message || String(e),
      usage,
      finishedAt: new Date(),
    });
  }
}

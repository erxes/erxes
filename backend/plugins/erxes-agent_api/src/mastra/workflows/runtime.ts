import { ExpectedError } from 'erxes-api-shared/utils';
import {
  compileDefinition,
  CompiledDeps,
  CompiledRunResult,
  CompiledWorkflow,
  finalOutput,
} from './compiler';
import { TriggerEnvelope } from './envelope';
import { WorkflowDefinition } from './dsl';
import { isOperationAllowed, ToolPolicy } from '../tools/scope';
import {
  isDestructiveOperation,
  resolveDestructiveOpsPolicy,
} from '../tools/destructiveGuard';
import { writeAgentAction, makeAgentProcessId } from '../auditLog';
import { getOperationRegistry } from '../tools/operationRegistry';
import type { IModels } from '~/connectionResolvers';
import type { IMastraAgentDocument } from '@/agent/@types/agent';
import type { ProviderDocLike } from '../providers';
import type {
  IMastraWorkflowDocument,
  IMastraWorkflowRunDocument,
} from '@/workflow/@types/workflow';

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
  const prefix = (
    env.ERXES_AGENT_WORKFLOW_DB_PREFIX || 'erxes_mastra_runtime'
  ).trim();
  return `${prefix}_${tenant}`.replace(/[^a-zA-Z0-9_]/g, '_');
}

const storageCache = new Map<string, unknown>();

/** Builds (and caches) the tenant's dedicated Mastra snapshot store. */
function getWorkflowStorage(tenant: string): unknown {
  const dbName = workflowDbName(tenant);
  const hit = storageCache.get(dbName);
  if (hit) return hit;

  // require(), not import() — see the loader-deadlock note in compiler.ts.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MongoDBStore } = require('@mastra/mongodb'); // skipcq: JS-0359
  const storage = new MongoDBStore({
    id: `erxes-agent-workflows-${tenant}`,
    uri: process.env.MONGO_URL || 'mongodb://localhost:27017',
    dbName,
  });
  storageCache.set(dbName, storage);
  return storage;
}

/** Pulls the first JSON object out of a model reply (tolerates ```json fences). */
export function extractJsonObject(text: string): Record<string, unknown> {
  // Index-scan the first ``` fence (regex with a lazy [\s\S]*? backtracks
  // super-linearly on pathological input).
  let candidate = text;
  const fenceStart = text.indexOf('```');
  if (fenceStart !== -1) {
    let bodyStart = fenceStart + 3;
    if (text.slice(bodyStart, bodyStart + 4).toLowerCase() === 'json') {
      bodyStart += 4;
    }
    const fenceEnd = text.indexOf('```', bodyStart);
    if (fenceEnd !== -1) {
      candidate = text.slice(bodyStart, fenceEnd);
    }
  }
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end <= start) {
    throw new ExpectedError('judgment reply contained no JSON object');
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

/**
 * Judgment agents are built BARE — the bound agent's persona and model, but NO
 * tools and a single step. Going through getOrCreateAgent would bind the
 * agent's own search/execute meta-tools, letting the model run erxes
 * operations mid-judgment OUTSIDE the workflow's declared policy (and, on
 * schedule/automation runs, with the app token). The workflow policy is the
 * security boundary; judgment is classification only.
 */
const judgeCache = new Map<string, JudgeAgent>();

/** The minimal Mastra Agent surface the judgment path invokes. */
interface JudgeAgent {
  generate(
    messages: Array<{ role: string; content: string }>,
  ): Promise<{ text?: unknown }>;
}

/** Builds (and caches per agent version) the bare, tool-less judgment agent. */
function getJudgeAgent(
  agentConfig: IMastraAgentDocument,
  providers: ProviderDocLike[],
): JudgeAgent {
  const key = `${agentConfig._id}:${agentConfig.updatedAt?.getTime?.() ?? 0}`;
  const hit = judgeCache.get(key);
  if (hit) return hit;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Agent } = require('@mastra/core/agent'); // skipcq: JS-0359
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { buildModel } = require('../providers'); // skipcq: JS-0359

  const judge: JudgeAgent = new Agent({
    id: `judge-${agentConfig._id}`,
    name: `${agentConfig.name} (judgment)`,
    instructions:
      agentConfig.instructions ||
      'You are a precise classifier inside an automated workflow.',
    model: buildModel(agentConfig.provider, agentConfig.model, providers),
    defaultOptions: { maxSteps: 1 },
  });

  for (const cachedKey of judgeCache.keys()) {
    if (cachedKey.startsWith(`${agentConfig._id}:`)) {
      judgeCache.delete(cachedKey);
    }
  }
  judgeCache.set(key, judge);
  return judge;
}

/** The system prompt that constrains a judgment call to a strict JSON reply. */
function judgmentInstruction(outputSpec: Record<string, string>): string {
  const fields = Object.entries(outputSpec)
    .map(([field, spec]) => `  "${field}": ${spec}`)
    .join('\n');
  return `You are one step inside an automated workflow. Respond with ONLY a JSON object (no prose, no markdown) with exactly these fields:\n{\n${fields}\n}\nField spec legend: a trailing '?' means optional; 'enum:a,b,c' means the value MUST be one of the listed options, verbatim.`;
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
  models: IModels,
  definition: WorkflowDefinition,
  workflowId?: string,
): Promise<{ deps: CompiledDeps; usage: { llmCalls: number } }> {
  const settings = await models.MastraSettings.getSettings();
  const registry = await getOperationRegistry(settings);
  const usage = { llmCalls: 0 };
  const maxLlmCalls = definition.limits?.maxLlmCalls ?? 10;

  const deps: CompiledDeps = {
    executeOperation: async (operation, args) => {
      const meta = registry.operations.get(operation);
      if (!meta) {
        throw new ExpectedError(
          `operation "${operation}" does not exist on this instance`,
        );
      }
      if (!isOperationAllowed(meta, definition.policy as ToolPolicy)) {
        throw new ExpectedError(
          `operation "${operation}" is outside this workflow's policy`,
        );
      }
      const isMutation = meta.operationType === 'mutation';
      // Defense-in-depth: validation already rejects destructive ops without
      // consent, but re-check at execution time (a definition could be run
      // without re-validation) so a remove/delete/merge never slips through.
      if (
        isDestructiveOperation(meta) &&
        resolveDestructiveOpsPolicy(definition) !== 'allow'
      ) {
        if (isMutation)
          writeAgentAction(models, {
            source: 'workflow',
            workflowId,
            operation,
            operationType: meta.operationType,
            destructive: true,
            args: args || {},
            status: 'blocked',
            error: 'blocked by destructive-ops guard',
          });
        throw new ExpectedError(
          `operation "${operation}" deletes or merges data and is blocked for this workflow (set destructiveOps: "allow" to permit)`,
        );
      }
      // Stamp a correlation id on mutations so every DB change is traceable/
      // revertable as a unit; reads need none.
      const processId = isMutation ? makeAgentProcessId() : undefined;

      const { executeErxesOperation } = await import('../tools/erxesTools');
      const result = await executeErxesOperation(
        meta,
        args || {},
        settings,
        registry.inputTypesMap,
        registry.objectFieldsMap,
        processId,
      );

      // Audit trail: mutations only, best-effort.
      if (isMutation) {
        const failed =
          Boolean(result) &&
          typeof result === 'object' &&
          (result as { success?: unknown }).success === false;
        writeAgentAction(models, {
          source: 'workflow',
          workflowId,
          operation,
          operationType: meta.operationType,
          destructive: isDestructiveOperation(meta),
          args: args || {},
          status: failed ? 'failed' : 'success',
          error: failed
            ? String((result as { error?: unknown }).error ?? '')
            : undefined,
          processId,
        });
      }

      return result;
    },

    runJudgment: async ({ agentBindingId, prompt, outputSpec }) => {
      if (usage.llmCalls >= maxLlmCalls) {
        throw new ExpectedError(
          `workflow exceeded its LLM call limit (${maxLlmCalls}) — raise limits.maxLlmCalls if intentional`,
        );
      }
      usage.llmCalls += 1;

      const agentConfig = await models.MastraAgent.getAgent(agentBindingId);
      const providers = await models.MastraProvider.find({ isEnabled: true });
      const judge = getJudgeAgent(agentConfig, providers);

      const convo = [
        { role: 'system', content: judgmentInstruction(outputSpec) },
        { role: 'user', content: prompt },
      ];
      const res = await judge.generate(convo);
      return extractJsonObject(String(res?.text ?? ''));
    },
  };

  return { deps, usage };
}

/** Condenses Mastra's per-step results into the run record's summary shape. */
function summarizeSteps(
  resultSteps: CompiledRunResult['steps'] | undefined,
): Record<string, { status: string; error?: string }> {
  const summary: Record<string, { status: string; error?: string }> = {};
  for (const [id, stepResult] of Object.entries(resultSteps || {})) {
    summary[id] = {
      status: stepResult?.status || 'unknown',
      ...(stepResult?.error
        ? { error: String(stepResult.error?.message || stepResult.error) }
        : {}),
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
  models: IModels;
  subdomain: string;
  workflow: IMastraWorkflowDocument;
  envelope: TriggerEnvelope;
}): Promise<IMastraWorkflowRunDocument> {
  const { models, subdomain, workflow, envelope } = args;
  const definition = workflow.definition;
  const tenant = workflowTenant(subdomain);
  const key = `wf_${workflow._id}_v${workflow.version}`;

  const { deps, usage } = await buildRunDeps(models, definition, workflow._id);
  // NOT awaited — the Workflow object is a thenable (see compiler.ts).
  const compiled = compileDefinition(key, definition, deps);

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Mastra } = require('@mastra/core/mastra'); // skipcq: JS-0359
  const storage = getWorkflowStorage(tenant);
  // A fresh instance per run is deliberate: the compiled graph closes over
  // run-scoped effect handlers, and resume-by-runId from a fresh instance is
  // the verified durability model (docs/WORKFLOW-SPEC.md §7).
  const mastra = new Mastra({
    workflows: { [key]: compiled },
    storage,
    logger: false,
  });

  const wf = mastra.getWorkflow(key) as CompiledWorkflow;
  const run = wf.createRunAsync
    ? await wf.createRunAsync()
    : await wf.createRun();

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
    const result = await run.start({
      inputData: { trigger: envelope, steps: {} },
    });

    const status =
      result.status === 'success' ||
      result.status === 'suspended' ||
      result.status === 'canceled'
        ? result.status
        : 'failed';

    return models.MastraWorkflowRun.finishRun(record._id, {
      status,
      stepsSummary: summarizeSteps(result.steps),
      output:
        status === 'success'
          ? finalOutput(definition, result.result)
          : undefined,
      error:
        status === 'failed'
          ? String(result.error?.message || result.error || 'workflow failed')
          : undefined,
      usage,
      finishedAt: status === 'suspended' ? undefined : new Date(),
    });
  } catch (e) {
    return models.MastraWorkflowRun.finishRun(record._id, {
      status: 'failed',
      error: e?.message || String(e),
      usage,
      finishedAt: new Date(),
    });
  }
}

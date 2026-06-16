/**
 * Workflow-registration bridge.
 *
 * erxes workflows are declarative JSON definitions (mastra_workflows docs) that
 * the runtime compiles to Mastra workflow graphs PER RUN (runWorkflow →
 * buildRunDeps → compileDefinition → new Mastra({ workflows })). To make them
 * visible/runnable in Studio we compile every stored definition up front and
 * register them on the Studio Mastra instance, reusing the exact production
 * compiler + effect handlers. Resilient per-workflow.
 *
 * Note: the effect handlers (buildRunDeps) need the operation registry from the
 * gateway (:4000); a workflow whose deps can't be built is logged and skipped.
 * compileDefinition returns a thenable Workflow that is intentionally NOT awaited
 * (matches runtime.ts) — Mastra resolves it.
 */
import { buildRunDeps } from '~/mastra/workflows/runtime';
import { compileDefinition } from '~/mastra/workflows/compiler';
import { studioModels } from './tenant';

export async function buildStudioWorkflows(): Promise<Record<string, unknown>> {
  const workflows: Record<string, unknown> = {};

  let models: Awaited<ReturnType<typeof studioModels>>;
  let defs: Array<{ _id: string; version: number; name?: string; definition: unknown }>;
  try {
    models = await studioModels();
    defs = (await models.MastraWorkflow.getWorkflows()) as never;
  } catch (err) {
    console.error(
      '[erxes-studio] could not load workflows from Mongo:',
      (err as Error).message,
    );
    return workflows;
  }

  for (const wf of defs) {
    try {
      // Readable, unique Studio key: the workflow's title (sanitized) + a short
      // id suffix to disambiguate same-named workflows. (The prod run key is
      // `wf_<id>_v<version>`; Studio runs are separate, so a friendly key is fine.)
      const safe =
        String(wf.name || 'workflow')
          .replace(/[^a-zA-Z0-9 _-]/g, '')
          .trim()
          .replace(/\s+/g, '_')
          .slice(0, 48) || 'workflow';
      const key = `${safe}__${String(wf._id).slice(-6)}`;
      const { deps } = await buildRunDeps(models, wf.definition as never, wf._id);
      workflows[key] = compileDefinition(key, wf.definition as never, deps);
      console.log(`[erxes-studio] workflow: ${key}`);
    } catch (err) {
      console.error(
        `[erxes-studio] skipped workflow ${wf?.name ?? wf?._id}: ${(err as Error).message}`,
      );
    }
  }

  console.log(
    `[erxes-studio] ${Object.keys(workflows).length}/${defs.length} workflows registered`,
  );
  return workflows;
}

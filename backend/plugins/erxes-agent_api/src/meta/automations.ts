import {
  AutomationConfigs,
  createCoreModuleProducerHandler,
  TAutomationProducers,
  TAutomationProducersInput,
  TCoreModuleProducerContext,
} from 'erxes-api-shared/core-modules';
import { generateModels, IModels } from '~/connectionResolvers';
import { buildAutomationEnvelope } from '~/mastra/workflows/envelope';
import { runWorkflow } from '~/mastra/workflows/runtime';

/**
 * The automation:* trigger (docs/WORKFLOW-SPEC.md §6): ONE generic action —
 * "Run agent workflow" — registered with the central automations service.
 * Through it, every trigger erxes already knows (entity create/update events,
 * frontline fb/ig/inbox messages, ticket events, segment entry) can start a
 * workflow: the admin wires trigger → this action in the Automations UI and
 * picks a workflow id in the action config.
 */

// The automations engine awaits the action producer; a workflow with `wait`
// steps (or slow LLM judgments) must not hold that call hostage. We await up
// to this budget for a synchronous result, then let the run finish in the
// background — the MastraWorkflowRun record is updated either way.
const SYNC_RESULT_BUDGET_MS = 25_000;

const workflowAutomationProducers = {
  receiveActions: async (
    input: TAutomationProducersInput[TAutomationProducers.RECEIVE_ACTIONS],
    context: TCoreModuleProducerContext<IModels>,
  ) => {
    if (input.collectionType !== 'workflows') {
      return { result: null };
    }

    const { action, execution } = input;
    const workflowId = action?.config?.workflowId;
    if (!workflowId) {
      return {
        result: {
          success: false,
          error: 'No workflowId configured on this action',
        },
      };
    }

    const workflow =
      await context.models.MastraWorkflow.getWorkflow(workflowId);
    if (!workflow.isEnabled) {
      return {
        result: {
          success: false,
          error: `Workflow "${workflow.name}" is disabled`,
        },
      };
    }

    const envelope = buildAutomationEnvelope({
      triggerType: execution.triggerType,
      target: (execution.target as Record<string, any>) || {},
    });

    const runPromise = runWorkflow({
      models: context.models,
      subdomain: context.subdomain,
      workflow,
      envelope,
    }).catch((e) => {
      console.error(
        `[erxes-agent:workflows] automation-triggered run failed: ${e?.message}`,
      );
      return null;
    });

    const settled = await Promise.race([
      runPromise,
      new Promise<null>((resolve) => {
        const t = setTimeout(() => resolve(null), SYNC_RESULT_BUDGET_MS);
        t.unref?.();
      }),
    ]);

    if (!settled) {
      // Still running (waits / long judgments) — report and move on; the run
      // record carries the eventual outcome.
      return { result: { success: true, status: 'running', workflowId } };
    }

    return {
      result: {
        success: settled.status === 'success',
        status: settled.status,
        runId: settled._id,
        output: settled.output,
        error: settled.error,
      },
    };
  },
};

export const automations = {
  constants: {
    actions: [
      {
        moduleName: 'workflow',
        collectionName: 'workflows',
        method: 'create',
        icon: 'IconRobot',
        label: 'Run agent workflow',
        description:
          'Execute an AI agent workflow — the trigger document becomes the workflow input',
        isAvailableOptionalConnect: false,
        output: {
          variables: [
            { key: 'status', label: 'Run status' },
            { key: 'runId', label: 'Run id' },
            { key: 'output', label: 'Workflow output' },
            { key: 'error', label: 'Error' },
          ],
        },
      },
    ],
    triggers: [],
  },

  receiveActions: createCoreModuleProducerHandler({
    moduleName: 'automations',
    modules: { workflow: workflowAutomationProducers },
    methodName: TAutomationProducers.RECEIVE_ACTIONS,
    extractModuleName: (input: any) => input.moduleName,
    generateModels,
  }),
} as AutomationConfigs;

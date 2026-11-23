import { defineExtension } from '@earendil-works/pi-durable';
import { type Db, enterScope, withOrg } from '@erxes/core-db';
import { modelKey } from '~/modules/assistant/connections.service';
import { installedPlugins } from '~/modules/assistant/plugins';
import { modelsFor } from '~/modules/assistant/providers';
import { apiTools } from '~/modules/assistant/tools/apiTools';
import { AUTOMATION_AGENT } from '~/modules/automations/actions/agent';
import type { Agent } from './agent';
import { actionTools } from './automationActions';
import { type AutomationStepScope, automationStepOf } from './automationStep';
import { stepKeyCaller } from './stepApiKey';

const ROLE = `You carry out one step of an erxes automation, within the role of the member who turned the automation on.`;

const API = `Find API procedures with searchApi and call them with callApi: they read and change what this step's API key allows in erxes.`;

const ACTIONS = `Find automation actions with searchActions and run them with runAction: they send email, notify team members, call web addresses, change the run's record, and act in connected apps and plugins.`;

const CLOSING = `Use only these tools; nothing else is available to this step. Nobody reads along and nobody can answer questions: when something is missing, do what you can and say what you could not. End with a short plain answer, which later steps of the automation read.`;

/** The erxes API as the step's API key, when it has one, and the actions it allows. */
const toolsOf = async (tx: Db, step: AutomationStepScope) => {
  const { apiKeyId } = step.settings;
  // The key is checked once, as the step starts: a key removed later fails the next run.
  const caller = apiKeyId ? await stepKeyCaller(tx, step, apiKeyId) : null;

  const api = caller
    ? apiTools({
        caller: () => Promise.resolve(caller),
        orgId: step.orgId,
        threadId: null,
        codeMode: false,
        plugins: await installedPlugins(tx),
      })
    : [];

  return { api, actions: actionTools(step) };
};

/**
 * The agent an automation step asks (`core.agent.ask`), as the member who turned it on: the
 * automation actions, or the categories and actions the step chose, the erxes API as the step's
 * API key when it has one, on the step's model.
 */
export const automationAgent: Agent = {
  name: AUTOMATION_AGENT,
  setup: async (scope) => {
    const step = await automationStepOf(scope);

    return enterScope(step.member, scope.orgId, () =>
      withOrg(scope.orgId, async (tx) => {
        // The step's chosen model, else the organisation's default.
        const key = await modelKey(tx, step.settings.model ?? {});
        const { api, actions } = await toolsOf(tx, step);

        const instructions = [ROLE, api.length ? API : '', actions.length ? ACTIONS : '', CLOSING]
          .filter(Boolean)
          .join(' ');

        const extension = defineExtension({ name: 'automation', tools: [...api, ...actions] });

        return {
          models: modelsFor([key]),
          extensions: [extension],
          agent: {
            extensions: [extension],
            instructions,
            model: { provider: key.provider, modelId: key.model },
          },
        };
      }),
    );
  },
};

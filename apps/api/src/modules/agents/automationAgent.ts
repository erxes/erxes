import { defineExtension } from '@earendil-works/pi-durable';
import { automationRuns, automations, enterScope, withOrg } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { memberOf } from '~/http/auth';
import { installedPlugins } from '~/modules/assistant/plugins';
import { modelsFor } from '~/modules/assistant/providers';
import { apiTools } from '~/modules/assistant/tools/apiTools';
import { AUTOMATION_AGENT } from '~/modules/automations/actions/agent';
import type { Agent, AgentScope } from './agent';
import { agentModelKey } from './agentModels';

const INSTRUCTIONS = `You carry out one step of an erxes automation. Find what you need with searchApi and do it with callApi, within the role of the member who turned the automation on. Nobody reads along and nobody can answer questions: when something is missing, do what you can and say what you could not. End with a short plain answer, which later steps of the automation read.`;

/** A step's conversation is keyed `<run>-<step>`, so its run names the member it acts as. */
const memberOfStep = async ({ orgId, key }: AgentScope) => {
  const [runId = ''] = key.split('-');

  const [row] = await withOrg(orgId, (tx) =>
    tx
      .select({ userId: automations.activatedBy })
      .from(automationRuns)
      .innerJoin(automations, eq(automations.id, automationRuns.automationId))
      .where(eq(automationRuns.id, runId))
      .limit(1),
  );

  const member = row?.userId ? await memberOf(orgId, row.userId) : null;

  if (!member) throw fail('UNAUTHORIZED', 'The member who turned this automation on is not active');

  return member;
};

/** The agent an automation step asks (`core.agent.ask`): the API as the member who turned it on. */
export const automationAgent: Agent = {
  name: AUTOMATION_AGENT,
  setup: async (scope) => {
    const member = await memberOfStep(scope);

    return enterScope(member, scope.orgId, () =>
      withOrg(scope.orgId, async (tx) => {
        const key = await agentModelKey(tx, AUTOMATION_AGENT);
        const plugins = await installedPlugins(tx);

        const tools = apiTools({
          member,
          orgId: scope.orgId,
          threadId: null,
          codeMode: false,
          plugins,
        });

        const extension = defineExtension({ name: 'automation', tools });

        return {
          models: modelsFor([key]),
          extensions: [extension],
          agent: {
            extensions: [extension],
            instructions: INSTRUCTIONS,
            model: { provider: key.provider, modelId: key.model },
          },
        };
      }),
    );
  },
};

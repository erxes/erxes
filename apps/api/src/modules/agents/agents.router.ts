import { caller, db, requestOrgId, withOrg } from '@erxes/core-db';
import { fail, notFound } from '~/http/errors';
import { scoped, unscoped } from '~/orpc';
import { listAgentModels, setAgentModel } from './agentModels';
import { agentNamed, startRun } from './host';
import { pluginAgentDefinition } from './pluginAgents';
import { StorageBusy } from './storage';

interface Submit {
  agent: string;
  key: string;
  text: string;
  requestId?: string | undefined;
}

/** A plugin's message into one conversation of its own agent; the run goes on after this returns. */
const submitToAgent = async ({ agent, key, text, requestId }: Submit) => {
  const orgId = requestOrgId();

  if (!agent.startsWith(`${caller('plugin').plugin}.`)) throw notFound('Agent');

  await withOrg(orgId, (tx) => pluginAgentDefinition(tx, agent));

  await startRun(
    agentNamed(agent),
    { orgId, key },
    { type: 'input', content: text, ...(requestId ? { requestId } : {}) },
  ).catch((error: unknown) => {
    if (error instanceof StorageBusy) {
      throw fail('ASSISTANT_BUSY', 'Another server runs this conversation; try again shortly');
    }

    throw error;
  });

  return { ok: true as const };
};

export const agentsRouter = {
  submit: unscoped.agents.submit.handler(({ input }) => submitToAgent(input)),
  models: scoped.agents.models.handler(() => listAgentModels(db())),
  setModel: scoped.agents.setModel.handler(({ input }) =>
    setAgentModel(db(), input.agent, input.provider, input.model),
  ),
};

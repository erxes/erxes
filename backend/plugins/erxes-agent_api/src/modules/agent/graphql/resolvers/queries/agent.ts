import { ExpectedError } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { prepareChatTurn, persistTurn, runAgentTurn } from '@/agent/turn';

export const agentQueries = {
  mastraAgents: async (
    _parent: undefined,
    _args: undefined,
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('agentsView');
    return models.MastraAgent.getAgents(user?._id);
  },

  mastraAgent: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('agentsView');
    return models.MastraAgent.getAgent(_id, user?._id);
  },

  mastraAgentsMain: async (
    _parent: undefined,
    params: { page?: number; perPage?: number; searchValue?: string },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('agentsView');
    return models.MastraAgent.getAgentsList({
      ...(params || {}),
      userId: user?._id,
    });
  },

  mastraAgentChat: async (
    _parent: undefined,
    {
      agentId,
      message,
      threadId,
    }: { agentId: string; message: string; threadId?: string },
    { models, user, subdomain, checkPermission }: IContext,
  ) => {
    await checkPermission('agentsChat');
    if (!user?._id) throw new ExpectedError('Login required');

    const prepared = await prepareChatTurn({
      models,
      subdomain,
      user,
      agentId,
      message,
      threadId,
    });

    const { agent, convo, authCtx, memoryBinding } = prepared;
    const reply = await runAgentTurn({
      agent,
      convo,
      message,
      authCtx,
      memory: memoryBinding,
    });

    // Persist the completed exchange so the session survives reloads. Only the
    // final user + assistant text is stored (no tool-call frames in `content`),
    // which also keeps replayed history clean for reasoning models like Kimi.
    await persistTurn({ models, prepared, message, reply });

    return reply;
  },
};

import { IContext } from '~/connectionResolvers';
import { prepareChatTurn, persistTurn, runAgentTurn } from '@/agent/turn';

export const agentQueries = {
  mastraAgents: (
    _parent: undefined,
    _args: undefined,
    { models }: IContext,
  ) => {
    return models.MastraAgent.getAgents();
  },

  mastraAgent: (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.MastraAgent.getAgent(_id);
  },

  mastraAgentsMain: (
    _parent: undefined,
    params: { page?: number; perPage?: number; searchValue?: string },
    { models }: IContext,
  ) => {
    return models.MastraAgent.getAgentsList(params || {});
  },

  mastraAgentChat: async (
    _parent: undefined,
    {
      agentId,
      message,
      threadId,
    }: { agentId: string; message: string; threadId?: string },
    { models, user, subdomain }: IContext,
  ) => {
    if (!user?._id) throw new Error('Login required');

    const prepared = await prepareChatTurn({
      models,
      subdomain,
      user,
      agentId,
      message,
      threadId,
    });

    const { agent, tools, convo, authCtx, isLegacy } = prepared;
    const reply = await runAgentTurn({
      agent,
      tools,
      convo,
      message,
      isLegacy,
      authCtx,
    });

    // Persist the completed exchange so the session survives reloads. Only the
    // final user + assistant text is stored (no tool-call frames in `content`),
    // which also keeps replayed history clean for reasoning models like Kimi.
    await persistTurn({ models, prepared, message, reply });

    return reply;
  },
};

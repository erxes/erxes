import { IContext } from '~/connectionResolvers';
import { prepareChatTurn, persistTurn, runAgentTurn } from '@/agent/turn';

export const agentQueries = {
  mastraAgents: async (_: any, __: any, { models }: IContext) => {
    return models.MastraAgent.getAgents();
  },

  mastraAgent: async (
    _: any,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.MastraAgent.getAgent(_id);
  },

  mastraAgentsMain: async (
    _: any,
    params: { page?: number; perPage?: number; searchValue?: string },
    { models }: IContext,
  ) => {
    return models.MastraAgent.getAgentsList(params || {});
  },

  mastraAgentChat: async (
    _: any,
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

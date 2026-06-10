import { IContext } from '~/connectionResolvers';

const requireUserId = (user: any): string => {
  const userId = user?._id;
  if (!userId) throw new Error('Login required');
  return userId;
};

export const workflowQueries = {
  mastraWorkflows: async (_: any, _args: any, { models, user }: IContext) => {
    requireUserId(user);
    return models.MastraWorkflow.getWorkflows();
  },

  mastraWorkflow: async (_: any, { _id }: { _id: string }, { models, user }: IContext) => {
    requireUserId(user);
    return models.MastraWorkflow.getWorkflow(_id);
  },

  mastraWorkflowRuns: async (
    _: any,
    { workflowId, page, perPage }: { workflowId: string; page?: number; perPage?: number },
    { models, user }: IContext,
  ) => {
    requireUserId(user);
    return models.MastraWorkflowRun.getRuns({ workflowId, page, perPage });
  },
};

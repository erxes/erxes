import { IUserDocument } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

/** Resolve the logged-in user's _id, rejecting unauthenticated calls. */
const requireUserId = (user: IUserDocument | null | undefined): string => {
  const userId = user?._id;
  if (!userId) throw new Error('Login required');
  return userId;
};

/** Queries over workflow definitions and their run history. */
export const workflowQueries = {
  mastraWorkflows: (
    _parent: undefined,
    _args: undefined,
    { models, user }: IContext,
  ) => {
    requireUserId(user);
    return models.MastraWorkflow.getWorkflows();
  },

  mastraWorkflow: (
    _parent: undefined,
    { _id }: { _id: string },
    { models, user }: IContext,
  ) => {
    requireUserId(user);
    return models.MastraWorkflow.getWorkflow(_id);
  },

  mastraWorkflowRuns: (
    _parent: undefined,
    {
      workflowId,
      page,
      perPage,
    }: { workflowId: string; page?: number; perPage?: number },
    { models, user }: IContext,
  ) => {
    requireUserId(user);
    return models.MastraWorkflowRun.getRuns({ workflowId, page, perPage });
  },
};

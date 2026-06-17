import { IUserDocument } from 'erxes-api-shared/core-types';
import { ExpectedError } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

/** Resolve the logged-in user's _id, rejecting unauthenticated calls. */
const requireUserId = (user: IUserDocument | null | undefined): string => {
  const userId = user?._id;
  if (!userId) throw new ExpectedError('Login required');
  return userId;
};

/** Queries over workflow definitions and their run history. */
export const workflowQueries = {
  mastraWorkflows: async (
    _parent: undefined,
    _args: undefined,
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('workflowsView');
    requireUserId(user);
    return models.MastraWorkflow.getWorkflows();
  },

  mastraWorkflow: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('workflowsView');
    requireUserId(user);
    return models.MastraWorkflow.getWorkflow(_id);
  },

  mastraWorkflowRuns: async (
    _parent: undefined,
    {
      workflowId,
      page,
      perPage,
    }: { workflowId: string; page?: number; perPage?: number },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('workflowsView');
    requireUserId(user);
    return models.MastraWorkflowRun.getRuns({ workflowId, page, perPage });
  },
};

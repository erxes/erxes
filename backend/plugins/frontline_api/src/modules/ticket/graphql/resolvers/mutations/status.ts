import { requireLogin } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
import { IStatusEditInput } from '@/ticket/@types/status';
import { checkPipeline } from '~/modules/ticket/utils/ticket';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import { PermissionError } from '@/ticket/utils/permissionValidator';

/**
 * Asserts that the current user is the owner of the pipeline.
 * Status management (add/update/delete) is restricted to pipeline owners.
 */
const assertPipelineOwner = async (
  pipelineId: string,
  userId: string,
  models: IContext['models'],
): Promise<void> => {
  const pipeline = await models.Pipeline.findOne({ _id: pipelineId });

  if (!pipeline) {
    throw new Error('Pipeline not found');
  }

  if (pipeline.userId !== userId) {
    throw new PermissionError(
      'Access denied: Only the pipeline owner can manage statuses',
    );
  }
};

export const statusMutations = {
  addTicketStatus: async (
    _parent: undefined,
    params: IStatusEditInput,
    { models, user }: IContext,
  ) => {
    await checkPipeline({ models, pipelineId: params.pipelineId });
    await assertPipelineOwner(params.pipelineId, user._id, models);

    const status = await models.Status.addStatus(params);

    graphqlPubsub.publish(`ticketStatusChanged:${status._id}`, {
      ticketStatusChanged: { type: 'create', status },
    });
    graphqlPubsub.publish('ticketStatusListChanged', {
      ticketStatusListChanged: { type: 'create', status },
    });

    return status;
  },

  updateTicketStatus: async (
    _parent: undefined,
    { _id, ...params }: IStatusEditInput,
    { models, user }: IContext,
  ) => {
    const existing = await models.Status.getStatus(_id);
    await assertPipelineOwner(existing.pipelineId, user._id, models);

    const updatedStatus = await models.Status.updateStatus(_id, params);

    graphqlPubsub.publish(`ticketStatusChanged:${updatedStatus._id}`, {
      ticketStatusChanged: { type: 'update', status: updatedStatus },
    });
    graphqlPubsub.publish('ticketStatusListChanged', {
      ticketStatusListChanged: { type: 'update', status: updatedStatus },
    });

    return updatedStatus;
  },

  deleteTicketStatus: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models, user }: IContext,
  ) => {
    const existing = await models.Status.getStatus(_id);
    await assertPipelineOwner(existing.pipelineId, user._id, models);

    const deleted = await models.Status.removeStatus(_id);

    graphqlPubsub.publish(`ticketStatusChanged:${_id}`, {
      ticketStatusChanged: { type: 'delete', statusId: _id },
    });
    graphqlPubsub.publish('ticketStatusListChanged', {
      ticketStatusListChanged: { type: 'delete', statusId: _id },
    });

    return deleted;
  },
};

requireLogin(statusMutations, 'addTicketStatus');
requireLogin(statusMutations, 'updateTicketStatus');
requireLogin(statusMutations, 'deleteTicketStatus');

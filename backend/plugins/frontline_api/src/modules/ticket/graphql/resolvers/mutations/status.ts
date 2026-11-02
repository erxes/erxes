import { IContext } from '~/connectionResolvers';
import { IStatusEditInput } from '@/ticket/@types/status';
import { checkPipeline } from '~/modules/ticket/utils/ticket';
import { graphqlPubsub } from 'erxes-api-shared/utils';

export const statusMutations = {
  addTicketStatus: async (
    _parent: undefined,
    params: IStatusEditInput,
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('ticketStatusesManage');

    await checkPipeline({ models, pipelineId: params.pipelineId });

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
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('ticketStatusesManage');

    await models.Status.getStatus(_id);

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
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('ticketStatusesManage');

    await models.Status.getStatus(_id);

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

import { ITicketUpdate } from '~/modules/ticket/@types/ticket';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { createPermissionValidator } from '@/ticket/utils/permissionValidator';

export const ticketMutations = {
  createTicket: async (
    _parent: undefined,
    params: ITicketUpdate,
    { models, user, subdomain }: IContext,
  ) => {
    const permissionValidator = createPermissionValidator(models);

    const pipelineId =
      params.pipelineId ||
      (params.statusId
        ? (await models.Status.findOne({ _id: params.statusId }))?.pipelineId
        : undefined);

    if (pipelineId) {
      await permissionValidator.validatePipelineAccess(pipelineId, user);
    }

    const ticket = await models.Ticket.addTicket(params, user._id, subdomain);

    graphqlPubsub.publish(`ticketChanged:${ticket._id}`, {
      ticketChanged: { type: 'create', ticket },
    });
    graphqlPubsub.publish('ticketListChanged', {
      ticketListChanged: { type: 'create', ticket },
    });

    return ticket;
  },

  updateTicket: async (
    _parent: undefined,
    params: ITicketUpdate,
    { models, user, subdomain }: IContext,
  ) => {
    const updatedTicket = await models.Ticket.updateTicket({
      doc: params,
      userId: user._id,
      subdomain,
    });

    graphqlPubsub.publish(`ticketChanged:${updatedTicket._id}`, {
      ticketChanged: { type: 'update', ticket: updatedTicket },
    });
    graphqlPubsub.publish('ticketListChanged', {
      ticketListChanged: { type: 'update', ticket: updatedTicket },
    });

    return updatedTicket;
  },

  removeTicket: async (
    _parent: undefined,
    { _id }: { _id: string[] },
    { models, user }: IContext,
  ) => {
    const permissionValidator = createPermissionValidator(models);

    const tickets = await models.Ticket.find({
      _id: { $in: _id },
    });

    const checkedPipelines = new Set<string>();
    for (const ticket of tickets) {
      if (ticket.pipelineId && !checkedPipelines.has(ticket.pipelineId)) {
        await permissionValidator.validatePipelineAccess(
          ticket.pipelineId,
          user,
        );
        checkedPipelines.add(ticket.pipelineId);
      }
    }

    await models.Ticket.removeTicket(_id);

    tickets.forEach((ticket) => {
      graphqlPubsub.publish(`ticketChanged:${ticket._id}`, {
        ticketChanged: { type: 'delete', ticket },
      });
    });

    graphqlPubsub.publish('ticketListChanged', {
      ticketListChanged: { type: 'delete', tickets },
    });

    return {
      ok: 1,
      removedIds: _id,
    };
  },
};


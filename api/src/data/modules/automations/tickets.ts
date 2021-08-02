import { Tickets, Stages } from '../../../db/models';
import { graphqlPubsub } from '../../../pubsub';
import { sendError, sendSuccess } from './utils';

export const receiveRpcMessageTickets = async (action, doc) => {
  if (action === 'add-ticket') {
    try {
      const ticket = await Tickets.createTicket({ ...doc });

      const stage = await Stages.getStage(ticket.stageId);

      graphqlPubsub.publish('pipelinesChanged', {
        pipelinesChanged: {
          _id: stage.pipelineId,
          proccessId: doc.proccessId,
          action: 'itemAdd',
          data: {
            ticket,
            aboveItemId: doc.aboveItemId,
            destinationStageId: stage._id
          }
        }
      });

      return sendSuccess({ ticket });
    } catch (e) {
      return sendError(e.message);
    }
  }

  if (action === 'remove-ticket') {
    try {
      const ticket = await Tickets.findOne({ ...doc });
      if (!ticket) {
        return sendError('Ticket not found');
      }

      const stage = await Stages.getStage(ticket.stageId);

      const result = await Tickets.removeTickets([ticket._id]);

      graphqlPubsub.publish('pipelinesChanged', {
        pipelinesChanged: {
          _id: stage.pipelineId,
          proccessId: Math.random,
          action: 'itemsRemove',
          data: {
            ticket,
            destinationStageId: stage._id
          }
        }
      });

      return sendSuccess({ ...result });
    } catch (e) {
      return sendError(e.message);
    }
  }
};

import { IContext } from '../../../connectionResolver';
import {
  sendContactsMessage,
  sendCoreMessage,
  sendNotificationsMessage
} from '../../../messageBroker';
import { ITicketDocument } from '../../../models/definitions/tickets';
import { boardId } from '../../utils';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Tickets.findOne({ _id });
  },

  async companies(ticket: ITicketDocument, _args, { subdomain }: IContext) {
    const companyIds = await sendCoreMessage({
      subdomain,
      action: 'conformities.savedConformity',
      data: {
        mainType: 'ticket',
        mainTypeId: ticket._id,
        relTypes: ['company']
      },
      isRPC: true,
      defaultValue: []
    });

    const companies = await sendContactsMessage({
      subdomain,
      action: 'companies.findActiveCompanies',
      data: { selector: { _id: { $in: companyIds } } },
      isRPC: true,
      defaultValue: []
    });

    return (companies || []).map(({ _id }) => ({ __typename: 'Company', _id }));
  },

  async customers(ticket: ITicketDocument, _args, { subdomain }: IContext) {
    const customerIds = await sendCoreMessage({
      subdomain,
      action: 'conformities.savedConformity',
      data: {
        mainType: 'ticket',
        mainTypeId: ticket._id,
        relTypes: ['customer']
      },
      isRPC: true,
      defaultValue: []
    });

    const customers = await sendContactsMessage({
      subdomain,
      action: 'customers.findActiveCustomers',
      data: {
        selector: {
          _id: { $in: customerIds }
        }
      },
      isRPC: true,
      defaultValue: []
    });

    return (customers || []).map(({ _id }) => ({
      __typename: 'Customer',
      _id
    }));
  },

  assignedUsers(ticket: ITicketDocument) {
    return (ticket.assignedUserIds || [])
      .filter(e => e)
      .map(_id => ({
        __typename: 'User',
        _id
      }));
  },

  async pipeline(
    ticket: ITicketDocument,
    _args,
    { models: { Stages, Pipelines } }: IContext
  ) {
    const stage = await Stages.getStage(ticket.stageId);

    return Pipelines.findOne({ _id: stage.pipelineId });
  },

  boardId(ticket: ITicketDocument, _args, { models }: IContext) {
    return boardId(models, ticket);
  },

  stage(ticket: ITicketDocument, _args, { models: { Stages } }: IContext) {
    return Stages.getStage(ticket.stageId);
  },

  isWatched(ticket: ITicketDocument, _args, { user }: IContext) {
    const watchedUserIds = ticket.watchedUserIds || [];

    if (watchedUserIds.includes(user._id)) {
      return true;
    }

    return false;
  },

  hasNotified(ticket: ITicketDocument, _args, { user, subdomain }: IContext) {
    return sendNotificationsMessage({
      subdomain,
      action: 'checkIfRead',
      data: {
        userId: user._id,
        itemId: ticket._id
      },
      isRPC: true,
      defaultValue: true
    });
  },

  labels(
    ticket: ITicketDocument,
    _args,
    { models: { PipelineLabels } }: IContext
  ) {
    return PipelineLabels.find({ _id: { $in: ticket.labelIds || [] } });
  },

  async tags(ticket: ITicketDocument) {
    return (ticket.tagIds || []).map(_id => ({ __typename: 'Tag', _id }));
  },

  createdUser(ticket: ITicketDocument) {
    if (!ticket.userId) {
      return;
    }

    return { __typename: 'User', _id: ticket.userId };
  }
};

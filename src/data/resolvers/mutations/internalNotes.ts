import { Companies, Customers, Deals, InternalNotes, Pipelines, Stages, Tasks, Tickets } from '../../../db/models';
import { NOTIFICATION_CONTENT_TYPES, NOTIFICATION_TYPES } from '../../../db/models/definitions/constants';
import { IInternalNote } from '../../../db/models/definitions/internalNotes';
import { moduleRequireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';
import utils, { ISendNotification, putCreateLog, putDeleteLog, putUpdateLog } from '../../utils';

interface IInternalNotesEdit extends IInternalNote {
  _id: string;
}

const internalNoteMutations = {
  /**
   * Adds internalNote object and also adds an activity log
   */
  async internalNotesAdd(_root, args: IInternalNote, { user }: IContext) {
    const notifDoc: ISendNotification = {
      title: `${args.contentType.toUpperCase()} updated`,
      createdUser: user,
      action: `mentioned you in ${args.contentType}`,
      receivers: args.mentionedUserIds || [],
      content: ``,
      link: ``,
      notifType: ``,
      contentType: ``,
      contentTypeId: ``,
    };

    switch (args.contentType) {
      case 'deal': {
        const deal = await Deals.getDeal(args.contentTypeId);
        const stage = await Stages.getStage(deal.stageId || '');
        const pipeline = await Pipelines.getPipeline(stage.pipelineId || '');

        notifDoc.notifType = NOTIFICATION_TYPES.DEAL_EDIT;
        notifDoc.content = `"${deal.name}"`;
        notifDoc.link = `/deal/board?id=${pipeline.boardId}&pipelineId=${pipeline._id}&itemId=${deal._id}`;
        notifDoc.contentTypeId = deal._id;
        notifDoc.contentType = NOTIFICATION_CONTENT_TYPES.DEAL;
        break;
      }

      case 'customer': {
        const customer = await Customers.getCustomer(args.contentTypeId);

        notifDoc.notifType = NOTIFICATION_TYPES.CUSTOMER_MENTION;
        notifDoc.content = `"${customer.primaryEmail ||
          customer.firstName ||
          customer.lastName ||
          customer.primaryPhone}"`;
        notifDoc.link = `/contacts/customers/details/${customer._id}`;
        notifDoc.contentTypeId = customer._id;
        notifDoc.contentType = NOTIFICATION_CONTENT_TYPES.CUSTOMER;
        break;
      }

      case 'company': {
        const company = await Companies.getCompany(args.contentTypeId);

        notifDoc.notifType = NOTIFICATION_TYPES.CUSTOMER_MENTION;
        notifDoc.content = `"${company.primaryName || company.primaryEmail || company.primaryPhone}"`;
        notifDoc.link = `/contacts/companies/details/${company._id}`;
        notifDoc.contentTypeId = company._id;
        notifDoc.contentType = NOTIFICATION_CONTENT_TYPES.COMPANY;
        break;
      }

      case 'ticket': {
        const ticket = await Tickets.getTicket(args.contentTypeId);
        const stage = await Stages.getStage(ticket.stageId || '');
        const pipeline = await Pipelines.getPipeline(stage.pipelineId || '');

        notifDoc.notifType = NOTIFICATION_TYPES.TICKET_EDIT;
        notifDoc.content = `"${ticket.name}"`;
        notifDoc.link = `/inbox/ticket/board?id=${pipeline.boardId}&pipelineId=${pipeline._id}&itemId=${ticket._id}`;
        notifDoc.contentTypeId = ticket._id;
        notifDoc.contentType = NOTIFICATION_CONTENT_TYPES.TICKET;
        break;
      }

      case 'task': {
        const task = await Tasks.getTask(args.contentTypeId);
        const stage = await Stages.getStage(task.stageId || '');
        const pipeline = await Pipelines.getPipeline(stage.pipelineId || '');

        notifDoc.notifType = NOTIFICATION_TYPES.TASK_EDIT;
        notifDoc.content = `"${task.name}"`;
        notifDoc.link = `/task/board?id=${pipeline.boardId}&pipelineId=${pipeline._id}&itemId=${task._id}`;
        notifDoc.contentTypeId = task._id;
        notifDoc.contentType = NOTIFICATION_CONTENT_TYPES.TASK;
        break;
      }

      default:
        break;
    }

    await utils.sendNotification(notifDoc);

    const internalNote = await InternalNotes.createInternalNote(args, user);

    if (internalNote) {
      await putCreateLog(
        {
          type: 'internalNote',
          newData: JSON.stringify(args),
          object: internalNote,
          description: `${internalNote.contentType} has been created`,
        },
        user,
      );
    }

    return internalNote;
  },

  /**
   * Updates internalNote object
   */
  async internalNotesEdit(_root, { _id, ...doc }: IInternalNotesEdit, { user }: IContext) {
    const internalNote = await InternalNotes.findOne({ _id });
    const updated = await InternalNotes.updateInternalNote(_id, doc);

    if (internalNote) {
      await putUpdateLog(
        {
          type: 'internalNote',
          object: internalNote,
          newData: JSON.stringify(doc),
          description: `${internalNote.contentType} written at ${internalNote.createdDate} has been edited`,
        },
        user,
      );
    }

    return updated;
  },

  /**
   * Remove a channel
   */
  async internalNotesRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const internalNote = await InternalNotes.findOne({ _id });
    const removed = await InternalNotes.removeInternalNote(_id);

    if (internalNote) {
      await putDeleteLog(
        {
          type: 'internalNote',
          object: internalNote,
          description: `${internalNote.contentType} written at ${internalNote.createdDate} has been removed`,
        },
        user,
      );
    }

    return removed;
  },
};

moduleRequireLogin(internalNoteMutations);

export default internalNoteMutations;

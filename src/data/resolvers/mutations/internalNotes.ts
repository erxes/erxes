import { Companies, Customers, Deals, InternalNotes, Pipelines, Stages, Tasks, Tickets } from '../../../db/models';
import { NOTIFICATION_CONTENT_TYPES, NOTIFICATION_TYPES } from '../../../db/models/definitions/constants';
import { IDealDocument } from '../../../db/models/definitions/deals';
import { IInternalNote } from '../../../db/models/definitions/internalNotes';
import { ITaskDocument } from '../../../db/models/definitions/tasks';
import { ITicketDocument } from '../../../db/models/definitions/tickets';
import { moduleRequireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';
import utils, { ISendNotification, putCreateLog, putDeleteLog, putUpdateLog } from '../../utils';
import { notifiedUserIds } from '../boardUtils';

interface IInternalNotesEdit extends IInternalNote {
  _id: string;
}

const sendNotificationOfItems = async (
  item: IDealDocument | ITicketDocument | ITaskDocument,
  doc: ISendNotification,
  contentType: string,
  excludeUserIds: string[],
) => {
  const notifDocItems = { ...doc };
  const relatedReceivers = await notifiedUserIds(item);
  notifDocItems.action = `added note in ${contentType}`;

  notifDocItems.receivers = relatedReceivers.filter(id => {
    return excludeUserIds.indexOf(id) < 0;
  });

  utils.sendNotification(notifDocItems);
};

const internalNoteMutations = {
  /**
   * Adds internalNote object and also adds an activity log
   */
  async internalNotesAdd(_root, args: IInternalNote, { user }: IContext) {
    const { contentType, contentTypeId } = args;
    const mentionedUserIds = args.mentionedUserIds || [];

    const notifDoc: ISendNotification = {
      title: `${contentType.toUpperCase()} updated`,
      createdUser: user,
      action: `mentioned you in ${contentType}`,
      receivers: mentionedUserIds,
      content: ``,
      link: ``,
      notifType: ``,
      contentType: ``,
      contentTypeId: ``,
    };

    switch (contentType) {
      case 'deal': {
        const deal = await Deals.getDeal(contentTypeId);
        const stage = await Stages.getStage(deal.stageId);
        const pipeline = await Pipelines.getPipeline(stage.pipelineId);

        notifDoc.notifType = NOTIFICATION_TYPES.DEAL_EDIT;
        notifDoc.content = `"${deal.name}"`;
        notifDoc.link = `/deal/board?id=${pipeline.boardId}&pipelineId=${pipeline._id}&itemId=${deal._id}`;
        notifDoc.contentTypeId = deal._id;
        notifDoc.contentType = NOTIFICATION_CONTENT_TYPES.DEAL;

        await sendNotificationOfItems(deal, notifDoc, contentType, [...mentionedUserIds, user._id]);
        break;
      }

      case 'customer': {
        const customer = await Customers.getCustomer(contentTypeId);

        notifDoc.notifType = NOTIFICATION_TYPES.CUSTOMER_MENTION;
        notifDoc.content = Customers.getCustomerName(customer);
        notifDoc.link = `/contacts/customers/details/${customer._id}`;
        notifDoc.contentTypeId = customer._id;
        notifDoc.contentType = NOTIFICATION_CONTENT_TYPES.CUSTOMER;
        break;
      }

      case 'company': {
        const company = await Companies.getCompany(contentTypeId);

        notifDoc.notifType = NOTIFICATION_TYPES.CUSTOMER_MENTION;
        notifDoc.content = Companies.getCompanyName(company);
        notifDoc.link = `/contacts/companies/details/${company._id}`;
        notifDoc.contentTypeId = company._id;
        notifDoc.contentType = NOTIFICATION_CONTENT_TYPES.COMPANY;
        break;
      }

      case 'ticket': {
        const ticket = await Tickets.getTicket(contentTypeId);
        const stage = await Stages.getStage(ticket.stageId);
        const pipeline = await Pipelines.getPipeline(stage.pipelineId);

        notifDoc.notifType = NOTIFICATION_TYPES.TICKET_EDIT;
        notifDoc.content = `"${ticket.name}"`;
        notifDoc.link = `/inbox/ticket/board?id=${pipeline.boardId}&pipelineId=${pipeline._id}&itemId=${ticket._id}`;
        notifDoc.contentTypeId = ticket._id;
        notifDoc.contentType = NOTIFICATION_CONTENT_TYPES.TICKET;

        await sendNotificationOfItems(ticket, notifDoc, contentType, [...mentionedUserIds, user._id]);
        break;
      }

      case 'task': {
        const task = await Tasks.getTask(contentTypeId);
        const stage = await Stages.getStage(task.stageId);
        const pipeline = await Pipelines.getPipeline(stage.pipelineId);

        notifDoc.notifType = NOTIFICATION_TYPES.TASK_EDIT;
        notifDoc.content = `"${task.name}"`;
        notifDoc.link = `/task/board?id=${pipeline.boardId}&pipelineId=${pipeline._id}&itemId=${task._id}`;
        notifDoc.contentTypeId = task._id;
        notifDoc.contentType = NOTIFICATION_CONTENT_TYPES.TASK;

        await sendNotificationOfItems(task, notifDoc, contentType, [...mentionedUserIds, user._id]);
        break;
      }
    }

    await utils.sendNotification(notifDoc);

    const internalNote = await InternalNotes.createInternalNote(args, user);

    await putCreateLog(
      {
        type: 'internalNote',
        newData: JSON.stringify(args),
        object: internalNote,
        description: `${internalNote.contentType} has been created`,
      },
      user,
    );

    return internalNote;
  },

  /**
   * Updates internalNote object
   */
  async internalNotesEdit(_root, { _id, ...doc }: IInternalNotesEdit, { user }: IContext) {
    const internalNote = await InternalNotes.getInternalNote(_id);
    const updated = await InternalNotes.updateInternalNote(_id, doc);

    await putUpdateLog(
      {
        type: 'internalNote',
        object: internalNote,
        newData: JSON.stringify(doc),
        description: `${internalNote.contentType} written at ${internalNote.createdDate} has been edited`,
      },
      user,
    );

    return updated;
  },

  /**
   * Remove a channel
   */
  async internalNotesRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const internalNote = await InternalNotes.getInternalNote(_id);
    const removed = await InternalNotes.removeInternalNote(_id);

    await putDeleteLog(
      {
        type: 'internalNote',
        object: internalNote,
        description: `${internalNote.contentType} written at ${internalNote.createdDate} has been removed`,
      },
      user,
    );

    return removed;
  },
};

moduleRequireLogin(internalNoteMutations);

export default internalNoteMutations;

import { moduleRequireLogin } from "@erxes/api-utils/src/permissions";
import { IContext } from "@erxes/api-utils/src/types";
import { graphqlPubsub } from "../../../configs";
import { putCreateLog, putDeleteLog, putUpdateLog } from "../../../logUtils";
import { sendNotificationMessage, sendRPCMessage } from "../../../messageBroker";
import { InternalNotes } from "../../../models";
import { IInternalNote } from "../../../models/definitions/internalNotes";

interface IInternalNotesEdit extends IInternalNote {
  _id: string;
}

const internalNoteMutations = (serviceDiscovery) => ({
  /**
   * Adds internalNote object and also adds an activity log
   */
  async internalNotesAdd(_root, args: IInternalNote, { user }: IContext) {
  let { contentType, contentTypeId } = args;
    const mentionedUserIds = args.mentionedUserIds || [];

    let notifDoc = {
      title: `${contentType.toUpperCase()} updated`,
      createdUser: user,
      action: `mentioned you in ${contentType}`,
      receivers: mentionedUserIds,
      content: '',
      link: '',
      notifType: '',
      contentType: '',
      contentTypeId: ''
    };

    // contentType = 'cards:task'
     contentType = 'contacts:company'

    // *  [cards, deal]
    const [serviceName, type] = contentType.split(':');
    const isServiceAvailable = await serviceDiscovery.isAvailable(serviceName)

    if(!isServiceAvailable) {
      return null;
    }

    // working fine in card

    const updatedNotifDoc = await sendRPCMessage(`${serviceName}:rpc_queue:generateInteralNoteNotif`, {
      type,
      contentTypeId,
      notifDoc
    });


    if(updatedNotifDoc.notifOfItems) {
      // * deal, task, ticket orj irne
      // await sendNotificationOfItems(task, notifDoc, contentType, [
      //   ...mentionedUserIds,
      //   user._id
      // ]);

      await sendNotificationMessage('send', updatedNotifDoc);

      graphqlPubsub.publish('activityLogsChanged', {});

    }

    // if (updatedNotifDoc.notifOfItems) {
    //   await sendNotificationMessage('send', updatedNotifDoc);

    //   graphqlPubsub.publish('activityLogsChanged', {});
    // }


    if (updatedNotifDoc.contentType) {
      await sendNotificationMessage('send', updatedNotifDoc);
    }

    const internalNote = await InternalNotes.createInternalNote(args, user);

    await putCreateLog(
      {
        type: 'internalNote',
        newData: {
          ...args,
          createdUserId: user._id,
          createdAt: internalNote.createdAt
        },
        object: internalNote,
        description: `A note for ${internalNote.contentType} "${notifDoc.content}" has been created`
      },
      user
    );

    return internalNote;
  },

  /**
   * Updates internalNote object
   */
  async internalNotesEdit(
    _root,
    { _id, ...doc }: IInternalNotesEdit,
    { user }: IContext
  ) {
    const internalNote = await InternalNotes.getInternalNote(_id);
    const updated = await InternalNotes.updateInternalNote(_id, doc);

    await putUpdateLog(
      {
        type: 'internalNote',
        object: internalNote,
        newData: doc
      },
      user
    );

    graphqlPubsub.publish('activityLogsChanged', {});

    return updated;
  },

  /**
   * Removes an internal note
   */
  async internalNotesRemove(
    _root,
    { _id }: { _id: string },
    { user }: IContext
  ) {
    const internalNote = await InternalNotes.getInternalNote(_id);
    const removed = await InternalNotes.removeInternalNote(_id);

    await putDeleteLog(
      { type: 'internalNote', object: internalNote },
      user
    );

    graphqlPubsub.publish('activityLogsChanged', {});

    return removed;
  }
});

moduleRequireLogin(internalNoteMutations);

export default internalNoteMutations;
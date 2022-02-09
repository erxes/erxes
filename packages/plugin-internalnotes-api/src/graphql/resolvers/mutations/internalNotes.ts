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

const internalNoteMutations = {
  /**
   * Adds internalNote object and also adds an activity log
   */
  async internalNotesAdd(_root, args: IInternalNote, { user }: IContext) {
    const { contentType, contentTypeId } = args;
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

    const [serviceName, type] = contentType.split(':');

    const updatedNotifDoc = await sendRPCMessage(`${serviceName}:generateInteralNoteNotif`, {
      type,
      contentTypeId
    });

    if (updatedNotifDoc) {
      notifDoc = { ...notifDoc, ...updatedNotifDoc };

      await sendNotificationMessage('send', notifDoc);

      graphqlPubsub.publish('activityLogsChanged', {});
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
};

moduleRequireLogin(internalNoteMutations);

export default internalNoteMutations;
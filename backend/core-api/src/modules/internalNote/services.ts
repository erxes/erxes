import {
  graphqlPubsub,
  isEnabled,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { IInternalNote } from '~/modules/internalNote/types';

/**
 * Adds an internal note and its activity log. Shared by the GraphQL
 * `internalNotesAdd` resolver (which checks `internalNotesManage` first) and
 * the agent-facing `internalNotes.add` tRPC procedure.
 */
export const addInternalNote = async ({
  models,
  subdomain,
  user,
  doc,
}: {
  models: IModels;
  subdomain: string;
  user: IUserDocument;
  doc: IInternalNote;
}) => {
  const { contentType, contentTypeId, mentionedUserIds = [] } = doc;

  const [pluginName, moduleName] = contentType.split(':');

  const isServiceAvailable = await isEnabled(pluginName);
  if (!isServiceAvailable) {
    return null;
  }

  const notifDoc = {
    title: `${moduleName.toUpperCase()} updated`,
    createdUser: user,
    action: `mentioned you in ${contentType}`,
    receivers: mentionedUserIds,
    content: '',
    link: '',
    notifType: '',
    contentType: '',
    contentTypeId: '',
  };

  const updatedNotifDoc = await sendTRPCMessage({
    subdomain,

    pluginName,
    method: 'query',
    module: moduleName,
    action: 'generateInternalNoteNotif',
    input: {
      type: moduleName,
      contentTypeId,
      notifDoc,
    },
    defaultValue: {},
  });

  if (updatedNotifDoc.notifOfItems) {
    const { item } = updatedNotifDoc;

    const relatedReceivers = await sendTRPCMessage({
      subdomain,

      pluginName,
      method: 'query',
      module: moduleName,
      action: 'notifiedUserIds',
      input: {
        item,
      },
      defaultValue: [],
    });

    updatedNotifDoc.action = `added note in ${contentType}`;

    updatedNotifDoc.receivers = relatedReceivers.filter((id) => {
      return [...mentionedUserIds, user._id].indexOf(id) < 0;
    });

    //   sendNotificationsMessage({
    //     subdomain,
    //     action: 'send',
    //     data: updatedNotifDoc,
    //   });

    graphqlPubsub.publish('activityLogsChanged', {});
  }

  if (updatedNotifDoc.contentType) {
    //   await sendNotificationsMessage({
    //     subdomain,
    //     action: 'send',
    //     data: updatedNotifDoc,
    //   });
  }

  const note = await models.InternalNotes.createInternalNote(doc, user);

  if (contentTypeId) {
    try {
      const actorData = {
        _id: user._id,
        email: user.email,
        username: user.username,
        details: user.details,
        role: user.role,
      };

      const activityLog = await models.ActivityLogs.create({
        activityType: 'internalNote',
        targetId: contentTypeId,
        targetType: contentType,
        target: { _id: contentTypeId },
        action: {
          type: 'create',
          description: 'added a note',
        },
        metadata: {
          noteId: note._id.toString(),
          content: note.content,
        },
        changes: {},
        actorType: user.role || 'user',
        actor: actorData,
      });

      graphqlPubsub.publish(
        `activityLogInserted:${subdomain}:${contentTypeId}`,
        {
          activityLogInserted: activityLog.toObject(),
        },
      );
    } catch (e) {
      console.error('Failed to create activity log for internal note', e, {
        contentTypeId,
        contentType,
      });
    }
  }

  return note;
};

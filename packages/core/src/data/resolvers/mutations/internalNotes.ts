import {
  moduleRequireLogin,
  requireLogin
} from "@erxes/api-utils/src/permissions";
import { IContext } from "../../../connectionResolver";
import graphqlPubsub from "@erxes/api-utils/src/graphqlPubsub";
import { putCreateLog, putDeleteLog, putUpdateLog } from "../../../logUtils";
import {
  sendCommonMessage,
  sendNotificationsMessage
} from "../../../messageBroker";
import { isEnabled } from "@erxes/api-utils/src/serviceDiscovery";
import { IInternalNote } from "../../../db/models/definitions/internalNotes";

interface IInternalNotesEdit extends IInternalNote {
  _id: string;
}

const sendNotificationOfItems = async (
  subdomain: string,
  serviceName: any,
  item: any,
  doc: any,
  contentType: string,
  excludeUserIds: string[]
) => {
  const notifDocItems = { ...doc };

  const relatedReceivers = await sendCommonMessage({
    serviceName,
    action: "notifiedUserIds",
    subdomain,
    data: item,
    isRPC: true
  });

  notifDocItems.action = `added note in ${contentType}`;

  notifDocItems.receivers = relatedReceivers.filter(id => {
    return excludeUserIds.indexOf(id) < 0;
  });

  sendNotificationsMessage({
    subdomain,
    action: "send",
    data: notifDocItems
  });

  graphqlPubsub.publish("activityLogsChanged", {});
};

const internalNoteMutations = {
  /**
   * Adds internalNote object and also adds an activity log
   */
  async internalNotesAdd(
    _root,
    args: IInternalNote,
    { user, models, subdomain }: IContext
  ) {
    const { contentType, contentTypeId, mentionedUserIds = [] } = args;

    const [serviceName, type] = contentType.split(":");

    const isServiceAvailable = await isEnabled(serviceName);

    if (!isServiceAvailable) {
      return null;
    }

    const notifDoc = {
      title: `${type.toUpperCase()} updated`,
      createdUser: user,
      action: `mentioned you in ${contentType}`,
      receivers: mentionedUserIds,
      content: "",
      link: "",
      notifType: "",
      contentType: "",
      contentTypeId: ""
    };

    const updatedNotifDoc = await sendCommonMessage({
      subdomain,
      serviceName,
      action: "generateInternalNoteNotif",
      data: {
        type,
        contentTypeId,
        notifDoc
      },
      isRPC: true
    });

    if (updatedNotifDoc.notifOfItems) {
      const { item } = updatedNotifDoc;

      await sendNotificationOfItems(
        subdomain,
        serviceName,
        item,
        updatedNotifDoc,
        type,
        [...mentionedUserIds, user._id]
      );
    }

    if (updatedNotifDoc.contentType) {
      await sendNotificationsMessage({
        subdomain,
        action: "send",
        data: updatedNotifDoc
      });
    }

    const internalNote = await models.InternalNotes.createInternalNote(
      args,
      user
    );

    await putCreateLog(
      models,
      subdomain,
      {
        type: "internalNote",
        newData: {
          ...args,
          createdUserId: user._id,
          createdAt: internalNote.createdAt
        },
        object: internalNote,
        description: `A note for ${internalNote.contentType} "${updatedNotifDoc.content}" has been created`
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
    { user, models, subdomain }: IContext
  ) {
    const internalNote = await models.InternalNotes.getInternalNote(_id);
    const updated = await models.InternalNotes.updateInternalNote(_id, doc);

    await putUpdateLog(
      models,
      subdomain,
      {
        type: "internalNote",
        object: internalNote,
        newData: doc
      },
      user
    );

    graphqlPubsub.publish("activityLogsChanged", {});

    return updated;
  },

  /**
   * Removes an internal note
   */
  async internalNotesRemove(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    const internalNote = await models.InternalNotes.getInternalNote(_id);
    const removed = await models.InternalNotes.removeInternalNote(_id);

    await putDeleteLog(
      models,
      subdomain,
      { type: "internalNote", object: internalNote },
      user
    );

    graphqlPubsub.publish("activityLogsChanged", {});

    return removed;
  }
};

requireLogin(internalNoteMutations, "internalNotesAdd");
requireLogin(internalNoteMutations, "internalNotesEdit");
requireLogin(internalNoteMutations, "internalNotesRemove");

export default internalNoteMutations;

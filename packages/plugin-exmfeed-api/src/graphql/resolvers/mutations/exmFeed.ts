// import {
//   putCreateLog,
//   putDeleteLog,
//   putUpdateLog,
//   sendNotification
// } from 'erxes-api-utils';
// import { sendMobileNotification } from "../../../utils";
import { checkPermission } from '@erxes/api-utils/src';
import { sendCoreMessage, sendNotification } from '../../../messageBroker';

export const gatherDescriptions = async () => {
  const extraDesc = [];
  const description = 'description';

  return { extraDesc, description };
};

const exmFeedMutations = {
  exmFeedAdd: async (_root, doc, { user, docModifier, models, subdomain }) => {
    const exmFeed = await models.ExmFeed.createExmFeed(docModifier(doc), user);

    // await putCreateLog(
    //   messageBroker,
    //   gatherDescriptions,
    //   {
    //     type: 'exmFeed',
    //     newData: doc,
    //     object: exmFeed,
    //     extraParams: { models }
    //   },
    //   user
    // );

    let receivers = await sendCoreMessage({
      subdomain,
      action: 'users.find',
      data: {
        query: {
          _id: { $ne: user._id }
        }
      },
      isRPC: true,
      defaultValue: []
    });

    receivers = receivers.map(r => r._id);

    if (doc.contentType === 'bravo') {
      receivers = doc.recipientIds;
    }

    sendNotification(subdomain, {
      createdUser: user,
      title: doc.title,
      contentType: 'exmFeed',
      contentTypeId: exmFeed._id,
      notifType: 'plugin',
      action: `${doc.contentType} created`,
      content: doc.description,
      link: `/erxes-plugin-exm-feed/list=${exmFeed._id}`,
      receivers: receivers
    });

    sendCoreMessage({
      subdomain: subdomain,
      action: 'sendMobileNotification',
      data: {
        title: doc.title,
        body: doc.description,
        receivers
      }
    });

    if (doc.type === 'bravo' && models.Exms) {
      for (const userId of doc.recipientIds || []) {
        await models.Exms.useScoring(userId, 'exmBravoAdd');
      }
    }

    return exmFeed;
  },

  exmFeedEdit: async (
    _root,
    { _id, ...doc },
    { user, docModifier, models, messageBroker }
  ) => {
    const exmFeed = await models.ExmFeed.getExmFeed(_id);

    const updated = await models.ExmFeed.updateExmFeed(
      _id,
      docModifier(doc),
      user
    );

    // await putUpdateLog(
    //   messageBroker,
    //   gatherDescriptions,
    //   {
    //     type: 'exmFeed',
    //     object: exmFeed,
    //     newData: { ...doc },
    //     updatedDocument: updated,
    //     extraParams: { models }
    //   },
    //   user
    // );

    return updated;
  },

  exmFeedRemove: async (_root, { _id }, { models, user, messageBroker }) => {
    const exmFeed = await models.ExmFeed.removeExmFeed(_id);

    // await putDeleteLog(
    //   messageBroker,
    //   gatherDescriptions,
    //   {
    //     type: 'exmFeed',
    //     object: exmFeed,
    //     extraParams: { models }
    //   },
    //   user
    // );

    return exmFeed;
  },

  exmFeedToggleIsPinned: async (_root, { _id }, { models }) => {
    const exmFeed = await models.ExmFeed.getExmFeed(_id);

    await models.ExmFeed.updateOne(
      { _id },
      { $set: { isPinned: !exmFeed.isPinned } }
    );

    return !exmFeed.isPinned;
  },

  exmFeedEventGoingOrInterested: async (
    _root,
    { _id, goingOrInterested },
    { models, user }
  ) => {
    const exmFeed = await models.ExmFeed.getExmFeed(_id);

    const updateModifier: { $push?: any; $pull?: any } = {};
    const eventData = exmFeed.eventData || {};

    if (goingOrInterested === 'neither') {
      updateModifier.$pull = {
        'eventData.goingUserIds': user._id,
        'eventData.interestedUserIds': user._id
      };
    } else if (goingOrInterested === 'interested') {
      if ((eventData.interestedUserIds || []).includes(user._id)) {
        return exmFeed;
      }

      updateModifier.$pull = { 'eventData.goingUserIds': user._id };
      updateModifier.$push = { 'eventData.interestedUserIds': user._id };
    } else if (goingOrInterested === 'going') {
      if ((eventData.goingUserIds || []).includes(user._id)) {
        return exmFeed;
      }

      updateModifier.$push = { 'eventData.goingUserIds': user._id };
      updateModifier.$pull = { 'eventData.interestedUserIds': user._id };
    }

    await models.ExmFeed.updateOne({ _id }, updateModifier);

    return models.ExmFeed.getExmFeed(_id);
  }
};

checkPermission(exmFeedMutations, 'exmFeedAdd', 'manageExmActivityFeed');
checkPermission(exmFeedMutations, 'exmFeedEdit', 'manageExmActivityFeed');
checkPermission(exmFeedMutations, 'exmFeedRemove', 'manageExmActivityFeed');
checkPermission(
  exmFeedMutations,
  'exmFeedToggleIsPinned',
  'manageExmActivityFeed'
);
checkPermission(
  exmFeedMutations,
  'exmFeedEventGoingOrInterested',
  'manageExmActivityFeed'
);

export default exmFeedMutations;

import {
  putCreateLog,
  putDeleteLog,
  putUpdateLog,
  sendNotification,
} from 'erxes-api-utils';
import { sendMobileNotification } from '../../../utils';
import { checkPermission, requireLogin } from '@erxes/api-utils/src';

export const gatherDescriptions = async () => {
  let extraDesc = [];
  let description = 'description';

  return { extraDesc, description };
};

const exmFeedMutations = {
  exmFeedAdd: async (
    _root,
    doc,
    {
      checkPermission,
      user,
      docModifier,
      models,
      messageBroker,
      memoryStorage,
      graphqlPubsub,
    }
  ) => {
    const exmFeed = await models.ExmFeed.createExmFeed(
      models,
      docModifier(doc),
      user
    );

    await putCreateLog(
      messageBroker,
      gatherDescriptions,
      {
        type: 'exmFeed',
        newData: doc,
        object: exmFeed,
        extraParams: { models },
      },
      user
    );

    let receivers = await models.Users.find().distinct('_id');

    receivers = receivers.filter((r) => r._id !== user._id);

    sendNotification(models, memoryStorage, graphqlPubsub, {
      notifType: 'plugin',
      title: doc.title,
      content: doc.description,
      action: `${doc.contentType} created`,
      link: `/erxes-plugin-exm-feed/list`,
      createdUser: user,
      // exclude current user
      contentType: 'exmFeed',
      contentTypeId: exmFeed._id,
      receivers,
    });

    sendMobileNotification(models, {
      title: doc.title,
      body: doc.description,
      receivers,
    });

    if (doc.type === 'bravo' && models.Exms) {
      for (const userId of doc.recipientIds || []) {
        await models.Exms.useScoring(models, userId, 'exmBravoAdd');
      }
    }

    return exmFeed;
  },

  exmFeedEdit: async (
    _root,
    { _id, ...doc },
    { checkPermission, user, docModifier, models, messageBroker }
  ) => {
    const exmFeed = await models.ExmFeed.getExmFeed(models, _id);

    const updated = await models.ExmFeed.updateExmFeed(
      models,
      _id,
      docModifier(doc),
      user
    );

    await putUpdateLog(
      messageBroker,
      gatherDescriptions,
      {
        type: 'exmFeed',
        object: exmFeed,
        newData: { ...doc },
        updatedDocument: updated,
        extraParams: { models },
      },
      user
    );

    return updated;
  },

  exmFeedRemove: async (
    _root,
    { _id },
    { models, checkPermission, user, messageBroker }
  ) => {
    const exmFeed = await models.ExmFeed.removeExmFeed(models, _id);

    await putDeleteLog(
      messageBroker,
      gatherDescriptions,
      {
        type: 'exmFeed',
        object: exmFeed,
        extraParams: { models },
      },
      user
    );

    return exmFeed;
  },

  exmFeedToggleIsPinned: async (
    _root,
    { _id },
    { models, checkPermission, user }
  ) => {
    const exmFeed = await models.ExmFeed.getExmFeed(models, _id);

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
    const exmFeed = await models.ExmFeed.getExmFeed(models, _id);

    const updateModifier: { $push?: any; $pull?: any } = {};
    const eventData = exmFeed.eventData || {};

    if (goingOrInterested === 'neither') {
      updateModifier.$pull = {
        'eventData.goingUserIds': user._id,
        'eventData.interestedUserIds': user._id,
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

    return models.ExmFeed.getExmFeed(models, _id);
  },
};
requireLogin(exmFeedMutations, 'manageExmActivityFeed');

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

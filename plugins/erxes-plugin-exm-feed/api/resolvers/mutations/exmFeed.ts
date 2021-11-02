import { putCreateLog, putDeleteLog, putUpdateLog } from 'erxes-api-utils';

export const gatherDescriptions = async () => {
  let extraDesc = [];
  let description = 'description';

  return { extraDesc, description };
};

const exmFeedMutations = [
  {
    name: 'exmFeedAdd',
    handler: async (
      _root,
      doc,
      { checkPermission, user, docModifier, models, messageBroker }
    ) => {
      await checkPermission('manageExm', user);

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
          extraParams: { models }
        },
        user
      );

      return exmFeed;
    }
  },

  {
    name: 'exmFeedEdit',
    handler: async (
      _root,
      { _id, ...doc },
      { checkPermission, user, docModifier, models, messageBroker }
    ) => {
      await checkPermission('manageExm', user);

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
          extraParams: { models }
        },
        user
      );

      return updated;
    }
  },

  {
    name: 'exmFeedRemove',
    handler: async (
      _root,
      { _id },
      { models, checkPermission, user, messageBroker }
    ) => {
      await checkPermission('manageExm', user);

      const exmFeed = await models.ExmFeed.removeExmFeed(models, _id);

      await putDeleteLog(
        messageBroker,
        gatherDescriptions,
        {
          type: 'exmFeed',
          object: exmFeed,
          extraParams: { models }
        },
        user
      );

      return exmFeed;
    }
  },

  {
    name: 'exmFeedToggleIsPinned',
    handler: async (_root, { _id }, { models, checkPermission, user }) => {
      await checkPermission('manageExm', user);

      const exmFeed = await models.ExmFeed.getExmFeed(models, _id);

      await models.ExmFeed.updateOne(
        { _id },
        { $set: { isPinned: !exmFeed.isPinned } }
      );

      return !exmFeed.isPinned;
    }
  },

  {
    name: 'exmFeedEventGoingOrInterested',
    handler: async (_root, { _id, goingOrInterested }, { models, user }) => {
      const exmFeed = await models.ExmFeed.getExmFeed(models, _id);

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

      return models.ExmFeed.getExmFeed(models, _id);
    }
  }
];

export default exmFeedMutations;

// import { putCreateLog, putDeleteLog, putUpdateLog } from 'erxes-api-utils';

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
      { checkPermission, user, docModifier, models }
    ) => {
      await checkPermission('manageExm', user);

      const exmFeed = await models.ExmFeed.createExmFeed(
        models,
        docModifier(doc),
        user
      );

      // await putCreateLog(
      //   messageBroker,
      // gatherDescriptions,
      // {
      //   type: 'exmFeed',
      //   newData: doc,
      //   object: exmFeed,
      //   extraParams: { models }
      // },
      // user
      // );

      return exmFeed;
    }
  },

  {
    name: 'exmFeedEdit',
    handler: async (
      _root,
      { _id, ...doc },
      { checkPermission, user, docModifier, models }
    ) => {
      await checkPermission('manageExm', user);

      const updated = await models.ExmFeed.updateExmFeed(
        models,
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
    }
  },

  {
    name: 'exmFeedRemove',
    handler: async (_root, { _id }, { models, checkPermission, user }) => {
      await checkPermission('manageExm', user);

      const exmFeed = await models.ExmFeed.removeExmFeed(models, _id);

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
    }
  }
];

export default exmFeedMutations;

import { putCreateLog, putDeleteLog, putUpdateLog } from 'erxes-api-utils';

export const gatherDescriptions = async () => {
  let extraDesc = [];
  let description = 'description';

  return { extraDesc, description };
};

const exmFeedCommentMutations = [
  {
    name: 'exmFeedCommentAdd',
    handler: async (
      _root,
      doc,
      { checkPermission, user, docModifier, models, messageBroker }
    ) => {
      await checkPermission('manageExm', user);

      const comment = await models.ExmFeedComments.createComment(
        models,
        docModifier(doc),
        user
      );

      await putCreateLog(
        messageBroker,
        gatherDescriptions,
        {
          type: 'exmFeedComment',
          newData: doc,
          object: comment,
          extraParams: { models }
        },
        user
      );

      return comment;
    }
  },

  {
    name: 'exmFeedCommentEdit',
    handler: async (
      _root,
      { _id, ...doc },
      { messageBroker, checkPermission, user, docModifier, models }
    ) => {
      await checkPermission('manageExm', user);

      const comment = await models.ExmFeedComments.findOne({
        _id
      });

      const updated = await models.ExmFeedComments.updateComment(
        models,
        _id,
        docModifier(doc),
        user
      );

      await putUpdateLog(
        messageBroker,
        gatherDescriptions,
        {
          type: 'exmFeedComment',
          object: comment,
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
    name: 'exmFeedCommentRemove',
    handler: async (
      _root,
      { _id },
      { messageBroker, models, checkPermission, user }
    ) => {
      await checkPermission('manageExm', user);

      const comment = await models.ExmFeedComments.removeComment(models, _id);

      await putDeleteLog(
        messageBroker,
        gatherDescriptions,
        {
          type: 'exmFeedComment',
          object: comment,
          extraParams: { models }
        },
        user
      );

      return comment;
    }
  }
];

export default exmFeedCommentMutations;

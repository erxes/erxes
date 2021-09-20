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
      { checkPermission, user, docModifier, models }
    ) => {
      await checkPermission('manageExm', user);

      const comment = await models.ExmFeedComments.createComment(
        models,
        docModifier(doc),
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
      { checkPermission, user, docModifier, models }
    ) => {
      await checkPermission('manageExm', user);

      const updated = await models.ExmFeedComments.updateComment(
        models,
        _id,
        docModifier(doc),
        user
      );

      return updated;
    }
  },

  {
    name: 'exmFeedCommentRemove',
    handler: async (_root, { _id }, { models, checkPermission, user }) => {
      await checkPermission('manageExm', user);

      const comment = await models.ExmFeedComments.removeComment(models, _id);

      return comment;
    }
  }
];

export default exmFeedCommentMutations;

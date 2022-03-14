const commentMutations = [
  {
    name: 'commentAdd',
    handler: async (_root, doc, { user, docModifier, models }) => {
      const comment = await models.Comments.createComment(
        models,
        docModifier(doc),
        user
      );

      await models.Exms.useScoringConfig(models, user, 'commentAdd');

      return comment;
    }
  },

  {
    name: 'commentEdit',
    handler: async (_root, { _id, ...doc }, { user, docModifier, models }) => {
      const comment = await models.Comments.findOne({ _id });

      if (comment.createdBy !== user._id) {
        throw new Error('You can only edit your comment');
      }

      const updated = await models.Comments.updateComment(
        models,
        _id,
        docModifier(doc),
        user
      );

      return updated;
    }
  },

  {
    name: 'commentRemove',
    handler: async (_root, { _id }, { models, user }) => {
      const comment = await models.Comments.findOne({ _id });

      if (comment.createdBy !== user._id) {
        throw new Error('You can only delete your comment');
      }

      await models.Exms.useScoringConfig(models, user, 'commentRemove');

      return models.Comments.removeComment(models, _id);
    }
  }
];

export default commentMutations;

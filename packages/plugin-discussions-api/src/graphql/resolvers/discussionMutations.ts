const discussionMutations = {
  /**
   * Save discussion configuration
   */
  discussionsSave(_root, args, { cpUser, models }) {
    const { _id, ...doc } = args;

    if (!cpUser) {
      throw new Error('Login required');
    }

    return models.Discussions.saveDiscussion({
      _id,
      doc: { ...doc, createdUserId: cpUser.userId }
    });
  },

  async discussionsRemove(_root, { _id }, { cpUser, models }) {
    if (!cpUser) {
      throw new Error('Login required');
    }

    const disc = await models.Discussions.findOne({ _id });

    if (cpUser.userId !== disc.createdUserId) {
      throw new Error('Invalid request');
    }

    return models.Discussions.deleteOne({ _id });
  },

  discussionsVote(_root, args, { cpUser, models }) {
    const { _id, ...doc } = args;

    if (!cpUser) {
      throw new Error('Login required');
    }

    return models.Votes.vote({
      ...doc,
      createdUserId: cpUser.userId
    });
  }
};

export default discussionMutations;

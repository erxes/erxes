const exmFeedCommentQueries = [
  {
    name: 'exmFeedComments',
    handler: async (
      _root,
      { limit, feedId },
      { models, checkPermission, user }
    ) => {
      await checkPermission('showExm', user);

      const doc: any = {
        feedId,
        $or: [{ parentId: { $exists: false } }, { parentId: { $eq: null } }]
      };

      return {
        list: await models.ExmFeedComments.find(doc)
          .sort({ createdAt: -1 })
          .limit(limit || 20),
        totalCount: await models.ExmFeedComments.find(doc).countDocuments()
      };
    }
  }
];

export default exmFeedCommentQueries;

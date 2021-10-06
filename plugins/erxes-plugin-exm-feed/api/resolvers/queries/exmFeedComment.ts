const exmFeedCommentQueries = [
  {
    name: 'exmFeedComments',
    handler: async (
      _root,
      { limit, skip, feedId, parentId },
      { models, checkPermission, user }
    ) => {
      await checkPermission('showExm', user);

      const filter: any = {
        feedId
      };

      if (parentId) {
        filter.parentId = parentId;
      } else {
        filter.$or = [
          { parentId: { $exists: false } },
          { parentId: { $eq: null } }
        ];
      }

      return {
        list: await models.ExmFeedComments.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip || 0)
          .limit(limit || 20),
        totalCount: await models.ExmFeedComments.find(filter).countDocuments()
      };
    }
  }
];

export default exmFeedCommentQueries;

const exmFeedCommentQueries = [
  {
    name: 'exmFeedComments',
    handler: async (
      _root,
      { limit, skip, feedId, parentId },
      { models, checkPermission, user }
    ) => {
      await checkPermission('showExm', user);

      const doc: any = {
        feedId
      };

      if (parentId) {
        doc.parentId = parentId;
      } else {
        doc.$or = [
          { parentId: { $exists: false } },
          { parentId: { $eq: null } }
        ];
      }

      return {
        list: await models.ExmFeedComments.find(doc)
          .sort({ createdAt: -1 })
          .skip(skip || 0)
          .limit(limit || 20),
        totalCount: await models.ExmFeedComments.find(doc).countDocuments()
      };
    }
  }
];

export default exmFeedCommentQueries;

const exmFeedCommentQueries = [
  {
    name: 'exmFeedComments',
    handler: async (
      _root,
      { limit, feedId, parentId },
      { models, checkPermission, user }
    ) => {
      await checkPermission('showExm', user);

      const doc: any = { feedId };

      if (parentId === null) {
        doc.$or = [
          { parentId: { $exists: false } },
          { parentId: { $eq: null } }
        ];
      } else if (parentId) {
        doc.parentId = parentId;
      }

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

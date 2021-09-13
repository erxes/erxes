const exmFeedQueries = [
  {
    name: 'exmFeedDetail',
    handler: async (_root, params, { models, checkPermission, user }) => {
      await checkPermission('showExmFeed', user);

      return models.ExmFeed.findOne({ _id: params._id });
    }
  },
  {
    name: 'exmFeed',
    handler: async (
      _root,
      { title, limit },
      { models, checkPermission, user }
    ) => {
      await checkPermission('showExmFeed', user);

      const doc: any = {};

      if (title) {
        doc.title = new RegExp(`.*${title}.*`, 'i');
      }

      return {
        list: await models.ExmFeed.find(doc)
          .sort({ createdAt: -1 })
          .limit(limit || 20),
        totalCount: await models.ExmFeed.find(doc).countDocuments()
      };
    }
  }
];

export default exmFeedQueries;

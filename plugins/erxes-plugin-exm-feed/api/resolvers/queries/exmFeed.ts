const exmFeedQueries = [
  {
    name: 'exmFeedDetail',
    handler: async (_root, params, { models, checkPermission, user }) => {
      await checkPermission('showExm', user);

      return models.ExmFeed.findOne({ _id: params._id });
    }
  },
  {
    name: 'exmFeed',
    handler: async (
      _root,
      { title, contentType, limit, recipientType, type },
      { models, checkPermission, user }
    ) => {
      await checkPermission('showExm', user);

      const doc: any = {};

      if (title) {
        doc.title = new RegExp(`.*${title}.*`, 'i');
      }

      if (contentType) {
        doc.contentType = contentType;
      }

      if (contentType === 'bravo' && type === 'recipient') {
        if (recipientType === 'recieved') {
          doc.recipientIds = { $in: [user._id] };
        } else if (recipientType === 'sent') {
          doc.createdBy = user._id;
        } else {
          doc.$or = [
            { recipientIds: { $in: [user._id] } },
            { createdBy: user._id }
          ];
        }
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

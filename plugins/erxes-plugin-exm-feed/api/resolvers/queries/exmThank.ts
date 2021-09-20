const exmThankQueries = [
  {
    name: 'exmThanks',
    handler: async (
      _root,
      { limit, type },
      { models, checkPermission, user }
    ) => {
      await checkPermission('showExm', user);

      const doc: { createdBy?: string; recipientIds?: any } = {};

      if (type === 'recipient') {
        doc.recipientIds = { $in: [user._id] };
      } else {
        doc.createdBy = user._id;
      }

      return {
        list: await models.ExmThanks.find(doc)
          .sort({ createdAt: -1 })
          .limit(limit || 20),
        totalCount: await models.ExmThanks.find(doc).countDocuments()
      };
    }
  }
];

export default exmThankQueries;

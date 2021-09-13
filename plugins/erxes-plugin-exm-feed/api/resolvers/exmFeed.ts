const exmFeedResolvers = [
  {
    type: 'ExmFeed',
    field: 'createdUser',
    handler: (exmFeed, {}, { models }) => {
      return models.Users.findOne({ _id: exmFeed.createdBy });
    }
  },
  {
    type: 'ExmFeed',
    field: 'updatedUser',
    handler: (exmFeed, {}, { models }) => {
      return models.Users.findOne({ _id: exmFeed.updatedBy });
    }
  },
  {
    type: 'ExmFeed',
    field: 'recipients',
    handler: (exmFeed, {}, { models }) => {
      return models.Users.find({ _id: { $in: exmFeed.recipientIds } });
    }
  }
];

export default exmFeedResolvers;

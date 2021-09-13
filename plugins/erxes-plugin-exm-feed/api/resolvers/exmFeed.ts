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
  }
];

export default exmFeedResolvers;

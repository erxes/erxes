const exmThankResolvers = [
  {
    type: 'ExmThank',
    field: 'createdUser',
    handler: (exmThank, {}, { models }) => {
      return models.Users.findOne({ _id: exmThank.createdBy });
    }
  },
  {
    type: 'ExmThank',
    field: 'recipients',
    handler: (exmThank, {}, { models }) => {
      return models.Users.find({ _id: { $in: exmThank.recipientIds } });
    }
  }
];

export default exmThankResolvers;

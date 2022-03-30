const ExmThanks = {
  async createdUser(exmThank, {}, { models }) {
    const user = models.Users.findOne({ _id: exmThank.createdBy });
    return user;
  },

  async recipients(exmThank, {}, { models }) {
    const user = models.Users.find({ _id: { $in: exmThank.recipientIds } });
    return user;
  }
};

export default ExmThanks;

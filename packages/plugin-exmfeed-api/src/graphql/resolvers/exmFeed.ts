const ExmFeeds = {
  createdUser(exmFeed, {}, { coreModels }) {
    return coreModels.Users.findOne({ _id: exmFeed.createdBy });
  },

  updatedUser(exmFeed, {}, { coreModels }) {
    return coreModels.Users.findOne({ _id: exmFeed.updatedBy });
  },

  recipients(exmFeed, {}, { coreModels }) {
    return coreModels.Users.find({
      _id: { $in: exmFeed.recipientIds }
    }).toArray();
  },

  eventGoingUsers(exmFeed, {}, { coreModels }) {
    return coreModels.Users.find({
      _id: { $in: (exmFeed.eventData || {}).goingUserIds || [] }
    }).toArray();
  },

  eventInterestedUsers(exmFeed, {}, { coreModels }) {
    return coreModels.Users.find({
      _id: { $in: (exmFeed.eventData || {}).interestedUserIds || [] }
    }).toArray();
  },

  async commentCount(exmFeed, {}, { models }) {
    return models.Comments
      ? await models.Comments.find({
          contentId: exmFeed._id,
          contentType: 'exmFeed'
        }).countDocuments()
      : 0;
  },

  async likeCount(exmFeed, {}, { models }) {
    return models.Emojis
      ? await models.Emojis.find({
          contentId: exmFeed._id,
          contentType: 'exmFeed',
          type: 'like'
        }).countDocuments()
      : 0;
  },

  async heartCount(exmFeed, {}, { models }) {
    return models.Emojis
      ? await models.Emojis.find({
          contentId: exmFeed._id,
          contentType: 'exmFeed',
          type: 'heart'
        }).countDocuments()
      : 0;
  },

  async isHearted(exmFeed, {}, { models, user }) {
    return models.Emojis
      ? await models.Emojis.exists({
          contentId: exmFeed._id,
          contentType: 'exmFeed',
          type: 'heart',
          userId: user._id
        })
      : false;
  },

  async isLiked(exmFeed, {}, { models, user }) {
    return models.Emojis
      ? await models.Emojis.exists({
          contentId: exmFeed._id,
          contentType: 'exmFeed',
          type: 'like',
          userId: user._id
        })
      : false;
  }
};

export default ExmFeeds;

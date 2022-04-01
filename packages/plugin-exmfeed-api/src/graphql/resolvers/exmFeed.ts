const ExmFeeds = {
  createdUser(exmFeed) {
    return (
      exmFeed.createdBy && {
        __typename: 'User',
        _id: exmFeed.createdBy
      }
    );
  },

  updatedUser(exmFeed) {
    return (
      exmFeed.updatedBy && {
        __typename: 'User',
        _id: exmFeed.updatedBy
      }
    );
  },

  recipients(exmFeed) {
    return (exmFeed.recipientIds || []).map(_id => ({
      __typename: 'User',
      _id
    }));
  },

  eventGoingUsers(exmFeed) {
    const { eventData = {} } = exmFeed;
    const { goingUserIds } = eventData;

    return (goingUserIds || []).map(_id => ({
      __typename: 'User',
      _id
    }));
  },

  eventInterestedUsers(exmFeed) {
    const { eventData = {} } = exmFeed;
    const { interestedUserIds } = eventData;

    return (interestedUserIds || []).map(_id => (
      {
        __typename: 'User',
        _id
      }
    ))
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

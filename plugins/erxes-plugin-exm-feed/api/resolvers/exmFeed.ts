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
  },
  {
    type: 'ExmFeed',
    field: 'eventGoingUsers',
    handler: (exmFeed, {}, { models }) => {
      return models.Users.find({
        _id: { $in: (exmFeed.eventData || {}).goingUserIds || [] }
      });
    }
  },
  {
    type: 'ExmFeed',
    field: 'eventInterestedUsers',
    handler: (exmFeed, {}, { models }) => {
      return models.Users.find({
        _id: { $in: (exmFeed.eventData || {}).interestedUserIds || [] }
      });
    }
  },
  {
    type: 'ExmFeed',
    field: 'commentCount',
    handler: (exmFeed, {}, { models }) => {
      return models.ExmFeedComments.find({
        feedId: exmFeed._id
      }).countDocuments();
    }
  },
  {
    type: 'ExmFeed',
    field: 'likeCount',
    handler: (exmFeed, {}, { models }) => {
      return models.ExmFeedEmojis.find({
        feedId: exmFeed._id,
        type: 'like'
      }).countDocuments();
    }
  },
  {
    type: 'ExmFeed',
    field: 'heartCount',
    handler: (exmFeed, {}, { models }) => {
      return models.ExmFeedEmojis.find({
        feedId: exmFeed._id,
        type: 'heart'
      }).countDocuments();
    }
  },
  {
    type: 'ExmFeed',
    field: 'isHearted',
    handler: async (exmFeed, {}, { models, user }) => {
      const emoji = await models.ExmFeedEmojis.findOne({
        feedId: exmFeed._id,
        type: 'heart',
        userId: user._id
      });

      return Boolean(emoji);
    }
  },
  {
    type: 'ExmFeed',
    field: 'isLiked',
    handler: async (exmFeed, {}, { models, user }) => {
      const emoji = await models.ExmFeedEmojis.findOne({
        feedId: exmFeed._id,
        type: 'like',
        userId: user._id
      });

      return Boolean(emoji);
    }
  }
];

export default exmFeedResolvers;

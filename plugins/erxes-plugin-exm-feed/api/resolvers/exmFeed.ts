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
      return models.Comments
        ? models.Comments.find({
            contentId: exmFeed._id,
            contentType: 'exmFeed'
          }).countDocuments()
        : 0;
    }
  },
  {
    type: 'ExmFeed',
    field: 'likeCount',
    handler: (exmFeed, {}, { models }) => {
      return models.Emojis
        ? models.Emojis.find({
            contentId: exmFeed._id,
            contentType: 'exmFeed',
            type: 'like'
          }).countDocuments()
        : 0;
    }
  },
  {
    type: 'ExmFeed',
    field: 'heartCount',
    handler: (exmFeed, {}, { models }) => {
      return models.Emojis
        ? models.Emojis.find({
            contentId: exmFeed._id,
            contentType: 'exmFeed',
            type: 'heart'
          }).countDocuments()
        : 0;
    }
  },
  {
    type: 'ExmFeed',
    field: 'isHearted',
    handler: async (exmFeed, {}, { models, user }) => {
      return models.Emojis
        ? await models.Emojis.exists({
            contentId: exmFeed._id,
            contentType: 'exmFeed',
            type: 'heart',
            userId: user._id
          })
        : false;
    }
  },
  {
    type: 'ExmFeed',
    field: 'isLiked',
    handler: async (exmFeed, {}, { models, user }) => {
      return models.Emojis
        ? await models.Emojis.exists({
            contentId: exmFeed._id,
            contentType: 'exmFeed',
            type: 'like',
            userId: user._id
          })
        : false;
    }
  }
];

export default exmFeedResolvers;

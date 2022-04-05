import { sendReactionsMessage } from '../../messageBroker';

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

    return (interestedUserIds || []).map(_id => ({
      __typename: 'User',
      _id
    }));
  },

  async commentCount(exmFeed) {
    try {
      return await sendReactionsMessage({
        subdomain: 'os',
        action: 'comments.count',
        data: {
          contentId: exmFeed._id,
          contentType: 'exmFeed'
        },
        isRPC: true,
        defaultValue: 0
      });
    } catch (e) {
      return 0;
    }
  },

  async likeCount(exmFeed) {
    try {
      return await sendReactionsMessage({
        subdomain: 'os',
        action: 'emojies.likeCount',
        data: {
          contentId: exmFeed._id,
          contentType: 'exmFeed',
          type: 'like'
        },
        isRPC: true,
        defaultValue: 0
      });
    } catch (e) {
      return 0;
    }
  },

  async heartCount(exmFeed) {
    try {
      return await sendReactionsMessage({
        subdomain: 'os',
        action: 'emojies.heartCount',
        data: {
          contentId: exmFeed._id,
          contentType: 'exmFeed',
          type: 'heart'
        },
        isRPC: true,
        defaultValue: 0
      });
    } catch (e) {
      return 0;
    }
  },

  async isHearted(exmFeed, {}, { user }) {
    try {
      return await sendReactionsMessage({
        subdomain: 'os',
        action: 'emojies.isHearted',
        data: {
          contentId: exmFeed._id,
          contentType: 'exmFeed',
          type: 'heart',
          userId: user._id
        },
        isRPC: true,
        defaultValue: false
      });
    } catch (e) {
      return 0;
    }
  },

  async isLiked(exmFeed, {}, { user }) {
    try {
      return await sendReactionsMessage({
        subdomain: 'os',
        action: 'emojies.isLiked',
        data: {
          contentId: exmFeed._id,
          contentType: 'exmFeed',
          type: 'like',
          userId: user._id
        },
        isRPC: true,
        defaultValue: false
      });
    } catch (e) {
      return 0;
    }
  }
};

export default ExmFeeds;

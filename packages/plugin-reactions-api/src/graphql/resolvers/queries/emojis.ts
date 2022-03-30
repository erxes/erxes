import { requireLogin } from '@erxes/api-utils/src/permissions';

interface IArgs {
  contentId: string;
  contentType: string;
  type: string;
}

const emojiQueries = {
  emojiReactedUsers: async (_root, doc: IArgs, { models, coreModels }) => {
    const reactedUserIds = await models.Emojis.find(doc).distinct('userId');

    return coreModels.Users.find({ _id: { $in: reactedUserIds } }).toArray();
  },

  emojiCount: (_root, doc: IArgs, { models }) => {
    return models.Emojis.find(doc).countDocuments();
  },

  emojiIsReacted: async (_root, doc: IArgs, { models, user }) => {
    return models.Emojis.exists({
      ...doc,
      userId: user._id
    });
  }
};

requireLogin(emojiQueries, 'emojiReactedUsers');
requireLogin(emojiQueries, 'emojiCount');
requireLogin(emojiQueries, 'emojiIsReacted');

export default emojiQueries;

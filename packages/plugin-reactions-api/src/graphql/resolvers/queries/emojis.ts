import { requireLogin } from '@erxes/api-utils/src/permissions';
import { sendCoreMessage } from '../../../messageBroker';

interface IArgs {
  contentId: string;
  contentType: string;
  type: string;
}

const emojiQueries = {
  emojiReactedUsers: async (_root, doc: IArgs, { models, subdomain }) => {
    const reactedUserIds = await models.Emojis.find(doc).distinct('userId');

    return sendCoreMessage({
      subdomain,
      action: 'users.find',
      data: {
        query: {
          _id: { $in: reactedUserIds }
        }
      },
      isRPC: true
    });
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

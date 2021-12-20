import { CHAT_TYPE } from '../../definitions';
import { graphqlPubsub } from '../subscriptions/pubsub';

const chatMutations = [
  {
    name: 'chatAdd',
    handler: async (
      _root,
      { name, type, participantIds },
      { user, models }
    ) => {
      return models.Chats.createChat(
        models,
        { name, type, participantIds: (participantIds || []).concat(user._id) },
        user._id
      );
    }
  },
  {
    name: 'chatEdit',
    handler: async (_root, { _id, ...doc }, { models }) => {
      return models.Chats.updateChat(models, _id, doc);
    }
  },
  {
    name: 'chatRemove',
    handler: (_root, { _id }, { models }) => {
      return models.Chats.removeChat(models, _id);
    }
  },
  {
    name: 'chatMessageAdd',
    handler: async (_root, args, { models, user }) => {
      if (!args.content) {
        throw new Error('Content is required');
      }

      const doc = { ...args };

      const created = await models.ChatMessages.createChatMessage(
        models,
        doc,
        user._id
      );

      graphqlPubsub.publish('chatMessageInserted', {
        chatMessageInserted: created
      });

      return created;
    }
  },
  {
    name: 'chatMessageRemove',
    handler: (_root, { _id }, { models }) => {
      return models.ChatMessages.removeChatMessage(models, _id);
    }
  }
];

export default chatMutations;

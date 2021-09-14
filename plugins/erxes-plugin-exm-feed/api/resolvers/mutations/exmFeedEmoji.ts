export type EmojiDoc = {
  feedId: string;
  type: string;
  userId: string;
};

const exmFeedEmojiMutations = [
  {
    name: 'exmFeedEmojiLike',
    handler: async (_root, { feedId }, { user, models }) => {
      const doc: EmojiDoc = {
        feedId,
        type: 'like',
        userId: user._id
      };

      const emoji = await models.ExmFeedEmojis.findOne(doc);

      if (emoji) {
        throw new Error('You have already reacted');
      }

      await models.ExmFeedEmojis.createEmoji(models, doc);

      return 'success';
    }
  },

  {
    name: 'exmFeedEmojiUnLike',
    handler: async (_root, { feedId }, { user, models }) => {
      const doc: EmojiDoc = {
        feedId,
        type: 'like',
        userId: user._id
      };

      const emoji = await models.ExmFeedEmojis.findOne(doc);

      if (!emoji) {
        throw new Error('You have already reacted');
      }

      await models.ExmFeedEmojis.removeEmoji(models, doc);

      return 'success';
    }
  }
];

export default exmFeedEmojiMutations;

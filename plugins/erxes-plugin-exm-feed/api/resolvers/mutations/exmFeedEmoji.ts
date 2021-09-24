export type EmojiDoc = {
  feedId: string;
  type: string;
  userId: string;
};

const exmFeedEmojiMutations = [
  {
    name: 'exmFeedEmojiReact',
    handler: async (_root, { feedId, type = 'heart' }, { user, models }) => {
      const doc: EmojiDoc = {
        feedId,
        type,
        userId: user._id
      };

      const emoji = await models.ExmFeedEmojis.findOne(doc);

      if (emoji) {
        await models.ExmFeedEmojis.removeEmoji(models, doc);
      } else {
        await models.ExmFeedEmojis.createEmoji(models, doc);
      }

      return 'success';
    }
  }
];

export default exmFeedEmojiMutations;

export type EmojiDoc = {
  contentId: string;
  contentType: string;
  type: string;
  userId: string;
};

const emojiMutations = [
  {
    name: 'emojiReact',
    handler: async (
      _root,
      { contentId, contentType, type = 'heart' },
      { user, models }
    ) => {
      const doc: EmojiDoc = {
        contentId,
        contentType,
        type,
        userId: user._id
      };

      const alreadyReacted = await models.Emojis.exists(doc);

      if (alreadyReacted) {
        await models.Emojis.removeEmoji(models, doc);
      } else {
        await models.Emojis.createEmoji(models, doc);
      }

      return 'success';
    }
  }
];

export default emojiMutations;

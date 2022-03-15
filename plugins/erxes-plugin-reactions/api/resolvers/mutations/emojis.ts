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

        if (models.Exms) {
          await models.Exms.useScoring(models, user, 'removeEmoji');
        }
      } else {
        await models.Emojis.createEmoji(models, doc);

        if (models.Exms) {
          await models.Exms.useScoring(models, user, 'createEmoji');
        }
      }

      return 'success';
    }
  }
];

export default emojiMutations;

import { requireLogin } from '@erxes/api-utils/src/permissions';

export type EmojiDoc = {
  contentId: string;
  contentType: string;
  type: string;
  userId: string;
};

const emojiMutations = {
  emojiReact: async (
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
      await models.Emojis.removeEmoji(doc);

      // if (models.Exms) {
      //   await models.Exms.useScoring(models, user._id, 'removeEmoji');
      // }
    } else {
      await models.Emojis.createEmoji(doc);

      // if (models.Exms) {
      //   await models.Exms.useScoring(models, user._id, 'createEmoji');
      // }
    }

    return 'success';
  }
};

requireLogin(emojiMutations, 'emojiReact');

export default emojiMutations;

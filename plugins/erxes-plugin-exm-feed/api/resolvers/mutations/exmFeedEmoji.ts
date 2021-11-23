// import { updateUserScore, getScoringConfig } from 'erxes-api-utils';

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

      const alreadyReacted = await models.ExmFeedEmojis.exists(doc);

      // let action;
      // let earnOrSpend;

      if (alreadyReacted) {
        // action = 'unheart';
        // earnOrSpend = 'earn';

        await models.ExmFeedEmojis.removeEmoji(models, doc);
      } else {
        // action = 'heart';
        // earnOrSpend = 'spend';

        await models.ExmFeedEmojis.createEmoji(models, doc);
      }

      // const scoringConfig = await getScoringConfig(models, action, earnOrSpend);

      // if (scoringConfig) {
      //   const amount = scoringConfig.amount || 0;

      //   updateUserScore(
      //     models,
      //     user._id,
      //     alreadyReacted ? amount * -1 : amount
      //   );
      // }

      return 'success';
    }
  }
];

export default exmFeedEmojiMutations;

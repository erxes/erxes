import * as _ from 'underscore';
import { generateModels, IModels } from '../db/models';
import * as dotenv from 'dotenv';
dotenv.config();

export const postsMinutely = async (subdomain: string) => {
  try {
    const models = await generateModels(subdomain);
    if (process.env.NODE_ENV === 'development') {
      await models.Post.updateTrendScoreOfPublished({});
    } else {
      const now = Date.now();
      const oneDayDuration = 1 * 24 * 60 * 1000 * 1000;
      const oneDayAgo = new Date(now - oneDayDuration);

      await models.Post.updateTrendScoreOfPublished({
        stateChangedAt: { $gte: oneDayAgo }
      });
    }
  } catch (e) {
    console.error('postsMinutely failed');
    console.error(e);
  }
};

export const postsHourly = async (subdomain: string) => {
  try {
    const models = await generateModels(subdomain);

    const now = Date.now();
    const weekDuration = 7 * 24 * 60 * 1000 * 1000;
    const weekAgo = new Date(now - weekDuration);

    await models.Post.updateTrendScoreOfPublished({
      stateChangedAt: { $gte: weekAgo }
    });
  } catch (e) {
    console.error('postsHourly failed');
    console.error(e);
  }
};

export const postsDaily = async (subdomain: string) => {
  try {
    const models = await generateModels(subdomain);

    await models.Post.updateTrendScoreOfPublished({});
  } catch (e) {
    console.error('postsDaily failed');
    console.error(e);
  }
};

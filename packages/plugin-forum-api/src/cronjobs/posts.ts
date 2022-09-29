import { IModels } from '../db/models';
import * as dotenv from 'dotenv';
dotenv.config();

const oneMinuteDuration = 1 * 60 * 1000;
const oneHourDuration = 1 * 60 * 60 * 1000;
const oneDayDuration = 1 * 24 * 60 * 1000 * 1000;
const oneWeekDuration = 7 * 24 * 60 * 1000 * 1000;

export const postsMinutely = async (subdomain: string, { Post }: IModels) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      await Post.updateTrendScoreOfPublished({});
    } else {
      const now = Date.now();

      const oneDayAgo = new Date(now - oneDayDuration);

      await Post.updateTrendScoreOfPublished({
        stateChangedAt: { $gte: oneDayAgo }
      });
    }
  } catch (e) {
    console.error('postsMinutely failed');
    console.error(e);
  }
};

export const postsHourly = async (subdomain: string, { Post }: IModels) => {
  try {
    const now = Date.now();

    const oneDayAgo = new Date(now - oneDayDuration - oneMinuteDuration);

    const weekAgo = new Date(now - oneWeekDuration);

    await Post.updateTrendScoreOfPublished({
      stateChangedAt: { $lte: oneDayAgo, $gte: weekAgo }
    });
  } catch (e) {
    console.error('postsHourly failed');
    console.error(e);
  }
};

export const postsDaily = async (subdomain: string, { Post }: IModels) => {
  try {
    const now = Date.now();
    const weekAgo = new Date(now - oneWeekDuration - oneHourDuration);

    await Post.updateTrendScoreOfPublished({
      stateChangedAt: { $lte: weekAgo }
    });
  } catch (e) {
    console.error('postsDaily failed');
    console.error(e);
  }
};

import * as _ from 'underscore';
import { IModels } from '../db/models';
import * as dotenv from 'dotenv';
dotenv.config();

/**
 * Send conversation messages to customer
 */
export const postsMinutely = async (models: IModels, subdomain: string) => {
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
};

export const postsHourly = async (models: IModels, subdomain: string) => {
  if (process.env.NODE_ENV === 'development') return;

  const now = Date.now();
  const weekDuration = 7 * 24 * 60 * 1000 * 1000;
  const weekAgo = new Date(now - weekDuration);

  await models.Post.updateTrendScoreOfPublished({
    stateChangedAt: { $gte: weekAgo }
  });
};

export const postsDaily = async (models: IModels, subdomain: string) => {
  if (process.env.NODE_ENV === 'development') return;
  await models.Post.updateTrendScoreOfPublished({});
};

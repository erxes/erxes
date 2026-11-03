import {
  USER_ACTIVITY_DAY_MS,
  USER_ACTIVITY_SLOT_MS,
} from 'erxes-api-shared/core-modules';
import { generateModels } from '~/connectionResolvers';

const DUPLICATE_KEY = 11000;

export interface IUserActivityJob {
  subdomain: string;
  userId: string;
  at: number;
}

export const userActivityHandler = async ({
  subdomain,
  userId,
  at,
}: IUserActivityJob) => {
  if (!subdomain || !userId || !Number.isFinite(at)) {
    return;
  }

  const models = await generateModels(subdomain);
  const slot = Math.floor(at / USER_ACTIVITY_SLOT_MS);
  const utcDay = new Date(at - (at % USER_ACTIVITY_DAY_MS));

  // $addToSet keeps two devices or a re-delivered job from counting twice
  const record = () =>
    models.UserActivities.updateOne(
      { userId, utcDay },
      { $addToSet: { slots: slot }, $max: { lastSlot: slot } },
      { upsert: true },
    );

  try {
    await record();
  } catch (error) {
    // Concurrent upserts race on the unique index; the retry finds the row
    if ((error as { code?: number }).code !== DUPLICATE_KEY) {
      throw error;
    }

    await record();
  }
};

import {
  ILoyaltyPeriodRunCounts,
  ILoyaltyPeriodRunDocument,
} from '@/score/@types/periodRun';
import { loyaltyPeriodRunSchema } from '@/score/db/definitions/periodRun';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

// Enough history to see the last month of runs and nothing more.
const KEEP_RUNS = 60;

export interface ILoyaltyPeriodRunModel
  extends Model<ILoyaltyPeriodRunDocument> {
  startRun(): Promise<ILoyaltyPeriodRunDocument>;
  addBatch(
    runId: string,
    counts: ILoyaltyPeriodRunCounts,
    finished: boolean,
  ): Promise<void>;
  failRun(runId: string, error: string): Promise<void>;
}

export const loadLoyaltyPeriodRunClass = (models: IModels) => {
  class LoyaltyPeriodRun {
    public static async startRun() {
      const run = await models.LoyaltyPeriodRuns.create({
        startedAt: new Date(),
        status: 'running',
      });

      const stale = await models.LoyaltyPeriodRuns.find({}, { _id: 1 })
        .sort({ startedAt: -1 })
        .skip(KEEP_RUNS)
        .lean();

      if (stale.length) {
        await models.LoyaltyPeriodRuns.deleteMany({
          _id: { $in: stale.map(({ _id }) => _id) },
        });
      }

      return run;
    }

    // Each batch adds to the same run; the last one closes it.
    public static async addBatch(
      runId: string,
      counts: ILoyaltyPeriodRunCounts,
      finished: boolean,
    ) {
      await models.LoyaltyPeriodRuns.updateOne(
        { _id: runId },
        {
          $inc: { ...counts, batches: 1 },
          ...(finished
            ? { $set: { status: 'done', finishedAt: new Date() } }
            : {}),
        },
      );
    }

    public static async failRun(runId: string, error: string) {
      await models.LoyaltyPeriodRuns.updateOne(
        { _id: runId },
        { $set: { status: 'failed', finishedAt: new Date(), error } },
      );
    }
  }

  loyaltyPeriodRunSchema.loadClass(LoyaltyPeriodRun);

  return loyaltyPeriodRunSchema;
};

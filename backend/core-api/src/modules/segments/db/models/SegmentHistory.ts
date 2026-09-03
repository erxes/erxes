import {
  gatherSegmentEventTypes,
  SegmentMembershipTransition,
} from 'erxes-api-shared/core-modules';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  ISegmentDailyCountDocument,
  ISegmentLevelSampleDocument,
  ISegmentTransitionDocument,
  segmentDailyCountSchema,
  segmentLevelSampleSchema,
  segmentTransitionSchema,
} from '../definitions/segmentHistory';

export interface ISegmentTransitionModel extends Model<ISegmentTransitionDocument> {
  recordTransitions(args: {
    subdomain: string;
    contentType: string;
    transitions: SegmentMembershipTransition[];
  }): Promise<{ written: number }>;
}

const targetTypeFor = async (contentType: string) => {
  for (const [eventType, segmentTypes] of await gatherSegmentEventTypes()) {
    if (segmentTypes.includes(contentType)) {
      return eventType;
    }
  }

  return contentType;
};

const writeActivityLogs = async (
  models: IModels,
  subdomain: string,
  contentType: string,
  rows: {
    segmentId: string;
    recordId: string;
    action: 'joined' | 'left';
  }[],
) => {
  const segments = await models.Segments.find(
    { _id: { $in: [...new Set(rows.map((row) => row.segmentId))] } },
    { _id: 1, name: 1 },
  ).lean();

  const nameById = new Map(segments.map((s) => [s._id, s.name]));
  const targetType = await targetTypeFor(contentType);

  for (const row of rows) {
    const name = nameById.get(row.segmentId) || row.segmentId;

    await models.ActivityLogs.createActivityLog(subdomain, {
      activityType: `segment.${row.action}`,
      targetType,
      target: { _id: row.recordId, contentType },
      action: {
        type: `segment.${row.action}`,
        description:
          row.action === 'joined'
            ? `joined segment ${name}`
            : `left segment ${name}`,
      },
      changes: { [row.action]: { segmentId: row.segmentId, name } },
      actorType: 'system',
      actor: { name: 'Segmentation' },
      metadata: { contentType, segmentId: row.segmentId },
    });
  }
};

export const loadSegmentTransitionClass = (models: IModels) => {
  class SegmentTransition {
    public static async recordTransitions({
      subdomain,
      contentType,
      transitions,
    }: {
      subdomain: string;
      contentType: string;
      transitions: SegmentMembershipTransition[];
    }) {
      const createdAt = new Date();

      const rows = transitions.flatMap(({ segmentId, joined, left }) => [
        ...joined.map((recordId) => ({
          segmentId,
          contentType,
          recordId,
          action: 'joined' as const,
          createdAt,
        })),
        ...left.map((recordId) => ({
          segmentId,
          contentType,
          recordId,
          action: 'left' as const,
          createdAt,
        })),
      ]);

      if (!rows.length) {
        return { written: 0 };
      }

      await models.SegmentTransitions.insertMany(rows);

      await writeActivityLogs(models, subdomain, contentType, rows);

      return { written: rows.length };
    }
  }

  segmentTransitionSchema.loadClass(SegmentTransition);

  return segmentTransitionSchema;
};

export interface ISegmentDailyCountModel extends Model<ISegmentDailyCountDocument> {
  recordDailyCounts(
    counts: Record<string, number>,
    countedAt?: Date,
  ): Promise<void>;
}

const utcDay = (at: Date) => at.toISOString().slice(0, 10);

export const loadSegmentDailyCountClass = (models: IModels) => {
  class SegmentDailyCount {
    public static async recordDailyCounts(
      counts: Record<string, number>,
      countedAt: Date = new Date(),
    ) {
      const entries = Object.entries(counts);

      if (!entries.length) {
        return;
      }

      const date = utcDay(countedAt);

      await models.SegmentDailyCounts.bulkWrite(
        entries.map(([segmentId, count]) => ({
          updateOne: {
            filter: {
              segmentId,
              date,
              $or: [
                { updatedAt: { $exists: false } },
                { updatedAt: { $lte: countedAt } },
              ],
            },
            update: { $set: { count, updatedAt: countedAt } },
            upsert: true,
          },
        })),
      );
    }
  }

  segmentDailyCountSchema.loadClass(SegmentDailyCount);

  return segmentDailyCountSchema;
};

export interface ISegmentLevelSampleModel extends Model<ISegmentLevelSampleDocument> {
  recordLevel(args: {
    segmentId: string;
    count: number;
    at?: Date;
  }): Promise<void>;
  anchorFor(
    segmentId: string,
    at: Date,
  ): Promise<ISegmentLevelSampleDocument | null>;
}

export const loadSegmentLevelSampleClass = (models: IModels) => {
  class SegmentLevelSample {
    public static async recordLevel({
      segmentId,
      count,
      at = new Date(),
    }: {
      segmentId: string;
      count: number;
      at?: Date;
    }) {
      await models.SegmentLevelSamples.create({
        segmentId,
        count,
        at,
        reason: 'rebuild',
      });
    }

    public static async anchorFor(segmentId: string, at: Date) {
      return models.SegmentLevelSamples.findOne({
        segmentId,
        at: { $lte: at },
      })
        .sort({ at: -1 })
        .lean<ISegmentLevelSampleDocument>();
    }
  }

  segmentLevelSampleSchema.loadClass(SegmentLevelSample);

  return segmentLevelSampleSchema;
};

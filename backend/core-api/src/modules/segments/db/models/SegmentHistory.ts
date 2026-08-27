import {
  gatherSegmentEventTypes,
  SegmentMembershipTransition,
} from 'erxes-api-shared/core-modules';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  ISegmentDailyCountDocument,
  ISegmentTransitionDocument,
  segmentDailyCountSchema,
  segmentTransitionSchema,
} from '../definitions/segmentHistory';

/**
 * The record of how a segment's membership moved.
 *
 * Written only by the segmentation worker, from the delta an apply reports, so
 * a row here means a record really changed side - not that the segment was
 * evaluated again and found the same answer.
 */

export interface ISegmentTransitionModel
  extends Model<ISegmentTransitionDocument> {
  recordTransitions(args: {
    subdomain: string;
    contentType: string;
    transitions: SegmentMembershipTransition[];
  }): Promise<{ written: number }>;
}

/**
 * The activity log's name for a segment content type.
 *
 * Timelines are keyed by `plugin:module.collection`, which is what each
 * content type already declares as its `eventTypes`; a segment type is not a
 * timeline key on its own.
 */
const targetTypeFor = async (contentType: string) => {
  for (const [eventType, segmentTypes] of await gatherSegmentEventTypes()) {
    if (segmentTypes.includes(contentType)) {
      return eventType;
    }
  }

  return contentType;
};

/**
 * The same movements on each record's own timeline.
 *
 * Kept alongside the transition rows rather than replacing them: a timeline
 * answers "what happened to this record", while the rows answer "how did this
 * segment move", and the second is a per-segment, per-day aggregate the
 * timeline cannot serve.
 *
 * Names are not resolved per record - the target is the record itself, so the
 * only name worth reading is the segment's, and that is one lookup for the
 * whole batch.
 */
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
      // `targetId` is taken from `target._id` by the model.
      target: { _id: row.recordId, contentType },
      action: {
        type: `segment.${row.action}`,
        description:
          row.action === 'joined'
            ? `joined segment ${name}`
            : `left segment ${name}`,
      },
      changes: { [row.action]: { segmentId: row.segmentId, name } },
      // Nobody did this; the definition and the data did.
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

export interface ISegmentDailyCountModel
  extends Model<ISegmentDailyCountDocument> {
  recordDailyCounts(counts: Record<string, number>): Promise<void>;
}

/** UTC day, so a series does not shift with whoever is looking at it. */
const utcDay = (at: Date) => at.toISOString().slice(0, 10);

export const loadSegmentDailyCountClass = (models: IModels) => {
  class SegmentDailyCount {
    public static async recordDailyCounts(counts: Record<string, number>) {
      const entries = Object.entries(counts);

      if (!entries.length) {
        return;
      }

      const date = utcDay(new Date());

      // Upserted rather than appended: the row is the day's closing membership,
      // so a segment settled fifty times today still costs one row.
      await models.SegmentDailyCounts.bulkWrite(
        entries.map(([segmentId, count]) => ({
          updateOne: {
            filter: { segmentId, date },
            update: { $set: { count, updatedAt: new Date() } },
            upsert: true,
          },
        })),
      );
    }
  }

  segmentDailyCountSchema.loadClass(SegmentDailyCount);

  return segmentDailyCountSchema;
};

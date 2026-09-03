import { initTRPC } from '@trpc/server';
import {
  evaluateSegmentBatch,
  gatherSegmentFieldSources,
  gatherSegmentRelations,
  segmentDependencies,
  segmentDependsOnClock,
  segmentFingerprint,
} from 'erxes-api-shared/core-modules';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';
import {
  relationEdgesFor,
  subjectsForRelatedRecords,
} from '../utils/relationEdges';
import { publishSegmentBuild } from '../utils/publishBuild';
import { coreSegmentGateway } from '../utils/segmentGateway';
import {
  countSegmentMembers,
  estimateSegmentMembers,
  listSegmentMembers,
} from '../utils/runSegment';

const t = initTRPC.context<CoreTRPCContext>().create();

export const segmentsRouter = t.router({
  segment: t.router({
    isInSegment: t.procedure
      .input(z.object({ segmentId: z.string(), idToCheck: z.string() }))
      .query(async ({ input, ctx }) => {
        const { models, subdomain } = ctx;

        const segment = await models.Segments.getSegment(input.segmentId);

        if (!segment) {
          return false;
        }

        const { matched } = await evaluateSegmentBatch(
          coreSegmentGateway(models, subdomain),
          segment,
          [input.idToCheck],
        );

        return matched.length > 0;
      }),

    fetchSegment: t.procedure
      .input(
        z.object({
          segmentId: z.string(),
          cursor: z.string().optional(),
          limit: z.number().optional(),
        }),
      )
      .query(async ({ input, ctx }) => {
        const { models, subdomain } = ctx;

        const segment = await models.Segments.getSegment(input.segmentId);

        if (!segment) {
          return { ids: [] };
        }

        return listSegmentMembers(models, subdomain, segment, {
          cursor: input.cursor,
          limit: input.limit,
        });
      }),

    segmentCount: t.procedure
      .input(z.object({ segmentId: z.string() }))
      .query(async ({ input, ctx }) => {
        const { models, subdomain } = ctx;

        const segment = await models.Segments.getSegment(input.segmentId);

        return segment
          ? countSegmentMembers(models, subdomain, segment)
          : { count: 0 };
      }),

    dependentSegments: t.procedure
      .input(
        z.object({
          contentTypes: z.array(z.string()).optional(),
          ids: z.array(z.string()).optional(),
        }),
      )
      .query(async ({ input, ctx }) => {
        const { models } = ctx;

        if (!input.ids?.length && !input.contentTypes?.length) {
          return [];
        }

        const selector = input.ids?.length
          ? { _id: { $in: input.ids } }
          : { dependsOn: { $in: input.contentTypes || [] } };

        return models.Segments.find(
          { ...selector, status: 'active', ownedBy: { $exists: false } },
          { _id: 1, contentType: 1, root: 1, revision: 1 },
        ).lean();
      }),

    rebuildDerivedFields: t.procedure.mutation(async ({ ctx }) => {
      const { models } = ctx;

      const segments = await models.Segments.find(
        { root: { $exists: true } },
        {
          _id: 1,
          contentType: 1,
          root: 1,
          dependsOn: 1,
          fingerprint: 1,
          timeSensitive: 1,
        },
      ).lean();

      let rebuilt = 0;

      const { byField: fieldSources } = await gatherSegmentFieldSources();

      for (const segment of segments) {
        const { relations } = await gatherSegmentRelations(segment.contentType);

        const dependsOn = segmentDependencies(
          segment.contentType,
          segment.root,
          relations,
          fieldSources,
        );

        const fingerprint = segmentFingerprint(
          segment.contentType,
          segment.root,
        );

        const timeSensitive = segmentDependsOnClock(segment.root);

        if (
          dependsOn.join() === (segment.dependsOn || []).join() &&
          fingerprint === segment.fingerprint &&
          timeSensitive === Boolean(segment.timeSensitive)
        ) {
          continue;
        }

        await models.Segments.updateOne(
          { _id: segment._id },
          { $set: { dependsOn, fingerprint, timeSensitive } },
        );
        rebuilt++;
      }

      return { segments: segments.length, rebuilt };
    }),

    relationSubjects: t.procedure
      .input(
        z.object({
          subjectType: z.string(),
          relatedType: z.string(),
          relatedIds: z.array(z.string()),
        }),
      )
      .query(async ({ input, ctx }) =>
        subjectsForRelatedRecords(ctx.models, input),
      ),

    relationEdges: t.procedure
      .input(
        z.object({
          subjectType: z.string(),
          relatedType: z.string(),
          subjectIds: z.array(z.string()),
        }),
      )
      .query(async ({ input, ctx }) => relationEdgesFor(ctx.models, input)),

    setSegmentStatus: t.procedure
      .input(
        z.object({
          segmentId: z.string(),
          status: z.enum([
            'draft',
            'building',
            'active',
            'failed',
            'cancelled',
          ]),
          processed: z.number().optional(),
          total: z.number().optional(),
          starting: z.boolean().optional(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const building = input.status === 'building';
        const starting = input.starting ?? (building && !input.processed);

        const before = await ctx.models.Segments.findOneAndUpdate(
          { _id: input.segmentId },
          building
            ? {
                $set: {
                  status: input.status,
                  buildProcessed: input.processed ?? 0,
                  ...(input.total === undefined
                    ? {}
                    : { buildTotal: input.total }),
                  ...(starting ? { buildStartedAt: new Date() } : {}),
                },
                ...(starting ? { $unset: { buildCancelRequested: '' } } : {}),
              }
            : {
                $set: { status: input.status },
                $unset: {
                  buildStartedAt: '',
                  buildProcessed: '',
                  buildTotal: '',
                  buildCancelRequested: '',
                },
              },
          { projection: { buildCancelRequested: 1 } },
        );

        const cancelled = Boolean(!starting && before?.buildCancelRequested);

        publishSegmentBuild({
          segmentId: input.segmentId,
          status: input.status,
          ...(building
            ? {
                buildProcessed: input.processed ?? 0,
                ...(input.total === undefined
                  ? {}
                  : { buildTotal: input.total }),
              }
            : {}),
        });

        return { status: input.status, cancelled };
      }),

    segmentEstimate: t.procedure
      .input(z.object({ segmentId: z.string() }))
      .query(async ({ input, ctx }) => {
        const { models, subdomain } = ctx;

        const segment = await models.Segments.getSegment(input.segmentId);

        return segment
          ? estimateSegmentMembers(models, subdomain, segment)
          : { total: null };
      }),

    setMembersCount: t.procedure
      .input(
        z.object({
          counts: z.record(z.string(), z.number()),
          countedAt: z.string().optional(),
          anchor: z.boolean().optional(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const { models } = ctx;

        const countedAt = input.countedAt
          ? new Date(input.countedAt)
          : new Date();
        const entries = Object.entries(input.counts);

        if (!entries.length) {
          return { updated: 0 };
        }

        await models.Segments.bulkWrite(
          entries.map(([_id, membersCount]) => ({
            updateOne: {
              filter: {
                _id,
                $or: [
                  { membersCountedAt: { $exists: false } },
                  { membersCountedAt: { $lte: countedAt } },
                ],
              },
              update: { $set: { membersCount, membersCountedAt: countedAt } },
            },
          })),
        );

        if (input.anchor) {
          await Promise.all(
            entries.map(([segmentId, count]) =>
              models.SegmentLevelSamples.recordLevel({
                segmentId,
                count,
                at: countedAt,
              }),
            ),
          );
        }

        await models.SegmentDailyCounts.recordDailyCounts(
          input.counts,
          countedAt,
        );

        entries.forEach(([segmentId, membersCount]) =>
          publishSegmentBuild({ segmentId, membersCount }),
        );

        return { updated: entries.length };
      }),

    segmentsToReconcile: t.procedure
      .input(
        z.object({
          limit: z.number().min(1).max(500).optional(),
          before: z.string().optional(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const { models } = ctx;

        const segments = await models.Segments.find(
          {
            status: 'active',
            root: { $exists: true },
            ownedBy: { $exists: false },
            ...(input.before
              ? {
                  $or: [
                    { reconciledAt: { $exists: false } },
                    { reconciledAt: { $lt: new Date(input.before) } },
                  ],
                }
              : {}),
          },
          {
            _id: 1,
            contentType: 1,
            membersCount: 1,
            dependsOn: 1,
            timeSensitive: 1,
          },
        )
          .sort({ reconciledAt: 1 })
          .limit(input.limit ?? 50)
          .lean();

        if (!segments.length) {
          return [];
        }

        await models.Segments.updateMany(
          { _id: { $in: segments.map((segment) => segment._id) } },
          { $set: { reconciledAt: new Date() } },
        );

        return segments;
      }),

    adjustMembersCount: t.procedure
      .input(
        z.object({
          deltas: z.record(z.string(), z.number()),
          at: z.string().optional(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const { models } = ctx;

        const at = input.at ? new Date(input.at) : new Date();
        const entries = Object.entries(input.deltas).filter(
          ([, delta]) => delta !== 0,
        );

        if (!entries.length) {
          return { updated: 0 };
        }

        await models.Segments.bulkWrite(
          entries.map(([_id, delta]) => ({
            updateOne: {
              filter: { _id, membersCount: { $exists: true } },
              update: {
                $inc: { membersCount: delta },
                $set: { membersCountedAt: at },
              },
            },
          })),
        );

        const moved = await models.Segments.find(
          { _id: { $in: entries.map(([_id]) => _id) } },
          { _id: 1, membersCount: 1 },
        ).lean();

        const counts: Record<string, number> = {};

        for (const segment of moved) {
          if (typeof segment.membersCount === 'number') {
            counts[segment._id] = segment.membersCount;
            publishSegmentBuild({
              segmentId: segment._id,
              membersCount: segment.membersCount,
            });
          }
        }

        await models.SegmentDailyCounts.recordDailyCounts(counts, at);

        return { updated: Object.keys(counts).length };
      }),

    recordTransitions: t.procedure
      .input(
        z.object({
          contentType: z.string(),
          transitions: z.array(
            z.object({
              segmentId: z.string(),
              joined: z.array(z.string()),
              left: z.array(z.string()),
            }),
          ),
        }),
      )
      .mutation(async ({ input, ctx }) =>
        ctx.models.SegmentTransitions.recordTransitions({
          ...input,
          subdomain: ctx.subdomain,
        }),
      ),

    findOne: t.procedure
      .input(z.object({ _id: z.string() }))
      .query(async ({ input, ctx }) => {
        const { models } = ctx;

        return models.Segments.findOne({ _id: input._id }).lean();
      }),
  }),
});

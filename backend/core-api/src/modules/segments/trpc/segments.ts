import { initTRPC } from '@trpc/server';
import {
  evaluateSegmentBatch,
  gatherSegmentRelations,
  segmentDependencies,
  segmentFingerprint,
} from 'erxes-api-shared/core-modules';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';
import {
  relationEdgesFor,
  subjectsForRelatedRecords,
} from '../utils/relationEdges';
import { coreSegmentGateway } from '../utils/segmentGateway';
import {
  collectSegmentMembers,
  countSegmentMembers,
  listSegmentMembers,
} from '../utils/runSegment';

const t = initTRPC.context<CoreTRPCContext>().create();

/**
 * The contract other plugins call. `fetchSegment` and `isInSegment` keep their
 * names and their answers; underneath they now compile the segment tree into a
 * query the owning plugin runs.
 */
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

        // Evaluated rather than filtered, so a definition that reaches into
        // another plugin - a count of a customer's deals - answers exactly
        // instead of being reported as unsupported.
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

    /** Every member id. Pages internally so no response carries the whole set. */
    segmentMemberIds: t.procedure
      .input(z.object({ segmentId: z.string() }))
      .query(async ({ input, ctx }) => {
        const { models, subdomain } = ctx;

        const segment = await models.Segments.getSegment(input.segmentId);

        return segment ? collectSegmentMembers(models, subdomain, segment) : [];
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

    /**
     * The segments that read any of these content types - the segmentation
     * worker's entry point. One indexed lookup, rather than walking every
     * definition to see which ones a change could have affected.
     */
    dependentSegments: t.procedure
      .input(z.object({ contentTypes: z.array(z.string()).min(1) }))
      .query(async ({ input, ctx }) => {
        const { models } = ctx;

        return models.Segments.find(
          {
            dependsOn: { $in: input.contentTypes },
            status: 'active',
          },
          { _id: 1, contentType: 1, root: 1, revision: 1 },
        ).lean();
      }),

    /**
     * Recomputes the fields derived from a segment's tree, for segments saved
     * before those fields existed.
     *
     * Runs here rather than as a standalone script because resolving a
     * relation to the content type it reaches needs the plugin registry, and
     * that only exists in a running service. Without it a segment quietly
     * stops being re-checked, and a duplicate of it cannot be recognised.
     */
    rebuildDerivedFields: t.procedure.mutation(async ({ ctx }) => {
      const { models } = ctx;

      const segments = await models.Segments.find(
        { root: { $exists: true } },
        { _id: 1, contentType: 1, root: 1, dependsOn: 1, fingerprint: 1 },
      ).lean();

      let rebuilt = 0;

      for (const segment of segments) {
        const { relations } = await gatherSegmentRelations(segment.contentType);

        const dependsOn = segmentDependencies(
          segment.contentType,
          segment.root,
          relations,
        );

        const fingerprint = segmentFingerprint(
          segment.contentType,
          segment.root,
        );

        if (
          dependsOn.join() === (segment.dependsOn || []).join() &&
          fingerprint === segment.fingerprint
        ) {
          continue;
        }

        await models.Segments.updateOne(
          { _id: segment._id },
          { $set: { dependsOn, fingerprint } },
        );
        rebuilt++;
      }

      return { segments: segments.length, rebuilt };
    }),

    /**
     * The subjects a change to related records can move.
     *
     * A deal changing stage moves the customer's membership, not the deal's,
     * and the link between them is a core relation record - so the worker asks
     * for it here rather than reaching into another service's data.
     */
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

    /** Subject id -> related ids, for a caller running the engine elsewhere. */
    relationEdges: t.procedure
      .input(
        z.object({
          subjectType: z.string(),
          relatedType: z.string(),
          subjectIds: z.array(z.string()),
        }),
      )
      .query(async ({ input, ctx }) => relationEdgesFor(ctx.models, input)),

    /**
     * Marks where a rebuild has got to.
     *
     * A rebuild clears the old membership before writing the new one, so the
     * segment really is empty for as long as it runs. Saying so beats showing
     * a count that is briefly, silently wrong.
     */
    setSegmentStatus: t.procedure
      .input(
        z.object({
          segmentId: z.string(),
          status: z.enum(['draft', 'building', 'active', 'failed']),
          /** Members written so far; only meaningful while building. */
          processed: z.number().optional(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const building = input.status === 'building';

        await ctx.models.Segments.updateOne(
          { _id: input.segmentId },
          building
            ? {
                $set: {
                  status: input.status,
                  buildProcessed: input.processed ?? 0,
                  ...(input.processed === undefined
                    ? { buildStartedAt: new Date() }
                    : {}),
                },
              }
            : {
                $set: { status: input.status },
                // A finished build leaves no progress behind to be mistaken
                // for a running one.
                $unset: { buildStartedAt: '', buildProcessed: '' },
              },
        );

        return { status: input.status };
      }),

    /** Records the member count a worker settled, per segment. */
    setMembersCount: t.procedure
      .input(z.object({ counts: z.record(z.string(), z.number()) }))
      .mutation(async ({ input, ctx }) => {
        const { models } = ctx;

        const countedAt = new Date();
        const entries = Object.entries(input.counts);

        if (!entries.length) {
          return { updated: 0 };
        }

        await models.Segments.bulkWrite(
          entries.map(([_id, membersCount]) => ({
            updateOne: {
              filter: { _id },
              update: { $set: { membersCount, membersCountedAt: countedAt } },
            },
          })),
        );

        // Written twice on purpose: onto the segment, where "how many right
        // now" is read, and into the day's row, which is what a growth chart
        // scans. Neither is cheaply derivable from the other.
        await models.SegmentDailyCounts.recordDailyCounts(input.counts);

        return { updated: entries.length };
      }),

    /** Who changed side, as an apply reported it. */
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

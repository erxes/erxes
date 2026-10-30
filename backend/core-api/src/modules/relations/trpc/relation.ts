import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

/**
 * `findRelatedIds` only resolves links for contact-side records — that is
 * the gap the agent hit: a customer/company document does not carry its
 * linked records. Other entity pairs stay inside the existing internal
 * procedures.
 */
const CONTACT_CONTENT_TYPES = ['core:customer', 'core:company'];
const AGENT_RELATED_IDS_LIMIT = 200;

const relationContentType = z
  .string()
  .regex(
    /^[a-z][a-z0-9_]*:[a-z][a-z0-9_.]*$/i,
    'Use a "plugin:type" content type such as "core:customer"',
  );

export const relationTrpcRouter = t.router({
  relation: t.router({
    getRelationsByEntities: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        return models.Relations.getRelationsByEntities(input);
      }),

    getRelationByEntity: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models } = ctx;

        return models.Relations.getRelationsByEntity(input);
      }),

    filterRelations: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models } = ctx;

        return models.Relations.filterRelations(input);
      }),

    getRelationIds: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;

      return models.Relations.getRelationIds(input);
    }),

    filterRelationIds: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models } = ctx;

        return models.Relations.filterRelationIds(input);
      }),

    findRelatedIds: t.procedure
      .input(
        z.object({
          contentType: relationContentType,
          contentId: z.string().min(1).max(64),
          relatedContentType: relationContentType,
        }),
      )
      .query(async ({ ctx, input }) => {
        if (input.contentType === input.relatedContentType) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message:
              'contentType and relatedContentType must differ — a relation links two different record types.',
          });
        }

        const contactSide =
          CONTACT_CONTENT_TYPES.includes(input.contentType) ||
          CONTACT_CONTENT_TYPES.includes(input.relatedContentType);

        if (!contactSide) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message:
              'One side must be a contact type ("core:customer" or "core:company") — use each plugin\'s own find tools for other links.',
          });
        }

        const ids = (await ctx.models.Relations.getRelationIds(input)).filter(
          Boolean,
        );

        return {
          ...input,
          relatedIds: ids.slice(0, AGENT_RELATED_IDS_LIMIT),
          total: ids.length,
          truncated: ids.length > AGENT_RELATED_IDS_LIMIT,
        };
      }),

    createMultipleRelations: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;

        return models.Relations.createMultipleRelations(input);
      }),

    updateRelation: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;

        return models.Relations.updateRelation(input);
      }),

    deleteRelation: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;

        return models.Relations.deleteRelation(input);
      }),
    cleanRelation: t.procedure
      .input(
        z.object({
          contentType: z.string(),
          contentIds: z.array(z.string()),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;
        return await models.Relations.cleanRelation(input);
      }),
    manageRelations: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;

        return models.Relations.manageRelations(input);
      }),
  }),
});

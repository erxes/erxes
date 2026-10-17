import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';
import { agentMeta } from '~/utils/agentMeta';

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

    getRelationIds: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
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
      .meta(
        agentMeta(
          'List the ids of records linked to a customer or company: { contentType, contentId, relatedContentType }, where one side is "core:customer" or "core:company". A customer\'s companies: { contentType: "core:customer", contentId, relatedContentType: "core:company" }; a company\'s customers: the reverse; a customer\'s or company\'s deals: relatedContentType "sales:deal". Returns { relatedIds, total, truncated }. Then fetch the records with their own tools, e.g. core.trpc.companies.find or sales.trpc.deal.find with { query: { _id: { $in: relatedIds } } }. Use this for any question about what a customer or company is linked to; their own records do not list these links.',
          { module: 'contacts', action: 'contactsRead' },
        ),
      )
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

    createRelation: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;

        return models.Relations.createRelation(input);
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
      .input(z.object({
        contentType: z.string(),
        contentIds: z.array(z.string())
      }))
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

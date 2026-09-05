import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';
import { agentMeta } from '~/utils/agentMeta';

const t = initTRPC.context<CoreTRPCContext>().create();

const AGENT_LIST_DEFAULT_LIMIT = 20;
const AGENT_LIST_MAX_LIMIT = 100;

export const similaritiesTrpcRouter = t.router({
  find: t.procedure
    .meta(
      agentMeta(
        'List product similarity templates (bulk-create templates that generate similar products from one star product). Input: { query?, sort?, limit?, skip? }. Results are capped at 100 rows (default 20). Use products.similarities.findOne to read a single template in full.',
        { module: 'products', action: 'productsRead' },
      ),
    )
    .input(
      z.object({
        query: z.record(z.unknown()).optional(),
        sort: z.record(z.union([z.literal(1), z.literal(-1)])).optional(),
        skip: z.number().int().nonnegative().max(1_000_000).optional(),
        limit: z.number().int().positive().max(AGENT_LIST_MAX_LIMIT).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { query, sort, skip, limit } = input;
      const { models } = ctx;

      return models.ProductSimilarities.find(query || {})
        .sort(sort || {})
        .skip(skip || 0)
        .limit(limit || AGENT_LIST_DEFAULT_LIMIT)
        .lean();
    }),

  findOne: t.procedure
    .meta(
      agentMeta(
        'Get one product similarity template by _id. Input: { _id }. Returns the template header (info), its property matching rules (propertiesData), the referenced product ids, and the starred source product.',
        { module: 'products', action: 'productsRead' },
      ),
    )
    .input(z.object({ _id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.models.ProductSimilarities.findOne({
        _id: input._id,
      }).lean();
    }),

  add: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
    return ctx.models.ProductSimilarities.addSimilarity(input);
  }),

  edit: t.procedure
    .input(z.object({ _id: z.string() }).passthrough())
    .mutation(async ({ ctx, input }) => {
      const { _id, ...doc } = input;
      return ctx.models.ProductSimilarities.editSimilarity(_id, doc as any);
    }),

  remove: t.procedure
    .input(z.object({ _id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.models.ProductSimilarities.removeSimilarity(input._id);
    }),
});

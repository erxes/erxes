import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';
import { DocumentAccessUser } from '../types';

const t = initTRPC.context<CoreTRPCContext>().create();

const documentQuerySchema = z.record(z.unknown());

/** Resolve the tenant-scoped acting user for document approval checks. */
const getDocumentUser = async (
  ctx: Awaited<ReturnType<CoreTRPCContext>>,
): Promise<DocumentAccessUser | undefined> => {
  if (!ctx.userId) return undefined;
  const user = await ctx.models.Users.findOne({ _id: ctx.userId })
    .select('_id isOwner')
    .lean<DocumentAccessUser | null>();
  return user || undefined;
};

export const documentTrpcRouter = t.router({
  documents: t.router({
    find: t.procedure
      .input(z.object({ query: documentQuerySchema.optional() }))
      .query(async ({ ctx, input }) => {
        const { query } = input;
        const { models } = ctx;
        const user = await getDocumentUser(ctx);
        const accessFilter = await models.Documents.getAccessFilter(user);
        return models.Documents.find({
          $and: [query || {}, accessFilter],
        }).lean();
      }),

    findOne: t.procedure
      .input(documentQuerySchema)
      .query(async ({ ctx, input }) => {
        const query = documentQuerySchema.parse(
          input.query || input.selector || input,
        );
        const { models } = ctx;

        if (!query || !Object.keys(query).length) {
          return {};
        }

        const user = await getDocumentUser(ctx);
        const accessFilter = await models.Documents.getAccessFilter(user);
        return models.Documents.findOne({ $and: [query, accessFilter] });
      }),

    print: t.procedure
      .input(
        z.object({
          _id: z.string().min(1),
          replacerIds: z.array(z.string()).optional(),
          config: z.record(z.unknown()).optional(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const { _id, replacerIds, config } = input;
        const { models } = ctx;
        return await models.Documents.processDocument({
          _id,
          replacerIds,
          config,
          user: await getDocumentUser(ctx),
        });
      }),
  }),
});

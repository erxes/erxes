import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';
import { agentMeta } from '~/utils/agentMeta';
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
      .meta(
        agentMeta(
          'List document templates (printable documents with placeholders): { query? }. Use to find the template _id before rendering with documents.print.',
          { module: 'documents', action: 'documentsRead' },
        ),
      )
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
      .meta(
        agentMeta(
          'Get a single document template by { _id } or any MongoDB-style query. Returns {} when nothing matches. Inspect its content to see which placeholders documents.print will fill.',
          { module: 'documents', action: 'documentsRead' },
        ),
      )
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
      .meta(
        agentMeta(
          'Render a document template for specific records. Input: { _id, replacerIds?, config? } — _id is the template ID; replacerIds are the record IDs (e.g. customer IDs) whose data fills the template placeholders. Find the template first with documents.find. Read-only: generates content, changes nothing.',
          { module: 'documents', action: 'documentsRead' },
        ),
      )
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

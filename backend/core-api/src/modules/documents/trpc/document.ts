import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const documentTrpcRouter = t.router({
  documents: t.router({
    find: t.procedure
      .meta({
        agent: {
          description:
            'List document templates (printable documents with placeholders): { query? }. Use to find the template _id before rendering with documents.print.',
          permission: { module: 'documents', action: 'documentsRead' },
        },
      })
      .input(z.any())
      .query(async ({ ctx, input }) => {
      const { query } = input;
      const { models } = ctx;

      return await models.Documents.find(query).lean();
    }),

    findOne: t.procedure
      .meta({
        agent: {
          description:
            'Get a single document template by { _id } or any MongoDB-style query. Returns {} when nothing matches. Inspect its content to see which placeholders documents.print will fill.',
          permission: { module: 'documents', action: 'documentsRead' },
        },
      })
      .input(z.any())
      .query(async ({ ctx, input }) => {
      const query = input?.query || input?.selector || input;
      const { models } = ctx;

      if (!query || !Object.keys(query).length) {
        return {};
      }

      return await models.Documents.findOne(query);
    }),

    print: t.procedure
      .meta({
        agent: {
          description:
            'Render a document template for specific records. Input: { _id, replacerIds?, config? } — _id is the template ID; replacerIds are the record IDs (e.g. customer IDs) whose data fills the template placeholders. Find the template first with documents.find. Read-only: generates content, changes nothing.',
          permission: { module: 'documents', action: 'documentsRead' },
        },
      })
      .input(z.any())
      .query(async ({ ctx, input }) => {
      const { _id, replacerIds, config } = input;
      const { models } = ctx;
      return await models.Documents.processDocument({
        _id,
        replacerIds,
        config,
      });
    }),
  }),
});

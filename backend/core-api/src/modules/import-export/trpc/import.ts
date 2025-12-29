import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';
import { saveErrorFile } from '~/modules/import-export/workers/utils/errorFileHandler';

const t = initTRPC.context<CoreTRPCContext>().create();

const progressSchema = z.object({
  processedRows: z.number().optional(),
  successRows: z.number().optional(),
  errorRows: z.number().optional(),
  totalRows: z.number().optional(),
  status: z
    .enum([
      'pending',
      'validating',
      'processing',
      'completed',
      'failed',
      'cancelled',
    ])
    .optional(),
  errorMessage: z.string().optional(),
  errorFileUrl: z.string().nullable().optional(),
});

export const importRouter = t.router({
  import: t.router({
    getImport: t.procedure
      .input(
        z.object({
          importId: z.string(),
        }),
      )
      .query(async ({ ctx, input }) => {
        return await ctx.models.Imports.getImport(input.importId);
      }),
    updateImportProgress: t.procedure
      .input(
        z.object({
          importId: z.string(),
          progress: progressSchema,
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { errorFileUrl, ...rest } = input.progress;

        const progressPayload = {
          ...rest,
          ...(errorFileUrl !== undefined
            ? { errorFileUrl: errorFileUrl ?? undefined }
            : {}),
        };

        return await ctx.models.Imports.updateImportProgress(
          input.importId,
          progressPayload,
        );
      }),
    addImportedIds: t.procedure
      .input(
        z.object({
          importId: z.string(),
          recordIds: z.array(z.string()),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        await ctx.models.Imports.addImportedIds(
          input.importId,
          input.recordIds,
        );
        return { status: 'ok' };
      }),
    saveErrorFile: t.procedure
      .input(
        z.object({
          importId: z.string(),
          headerRow: z.array(z.string()),
          errorRows: z.array(z.any()),
          keyToHeaderMap: z.record(z.string()),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const importDoc = await ctx.models.Imports.getImport(input.importId);

        if (!importDoc) {
          throw new Error('Import not found');
        }

        const fileKey = await saveErrorFile(
          importDoc.subdomain,
          input.headerRow,
          input.errorRows,
          input.keyToHeaderMap,
          ctx.models,
          input.importId,
        );

        return fileKey;
      }),
  }),
});

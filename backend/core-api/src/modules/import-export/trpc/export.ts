import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

const progressSchema = z.object({
  processedRows: z.number().optional(),
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
  lastCursor: z.string().optional(),
  estimatedSecondsRemaining: z.number().optional(),
});

export const exportRouter = t.router({
  export: t.router({
    getExport: t.procedure
      .input(
        z.object({
          exportId: z.string(),
        }),
      )
      .query(async ({ ctx, input }) => {
        return await ctx.models.Exports.getExport(input.exportId);
      }),
    updateExportProgress: t.procedure
      .input(
        z.object({
          exportId: z.string(),
          progress: progressSchema,
        }),
      )
      .mutation(async ({ ctx, input }) => {
        return await ctx.models.Exports.updateExportProgress(
          input.exportId,
          input.progress,
        );
      }),
    saveExportFile: t.procedure
      .input(
        z.object({
          exportId: z.string(),
          fileKey: z.string(),
          fileName: z.string(),
          fileIndex: z.number().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        return await ctx.models.Exports.saveExportFile(
          input.exportId,
          input.fileKey,
          input.fileName,
          input.fileIndex,
        );
      }),
  }),
});

import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { CoreTRPCContext } from '~/init-trpc';
import { uploadFile } from '~/utils/file/upload';

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
  fileKey: z.string().optional(),
  terminalError: z
    .object({
      code: z.string().optional(),
      stage: z.string().optional(),
      retryable: z.boolean().optional(),
    })
    .optional(),
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
        }),
      )
      .mutation(async ({ ctx, input }) => {
        return await ctx.models.Exports.saveExportFile(
          input.exportId,
          input.fileKey,
          input.fileName,
        );
      }),
    uploadExportFile: t.procedure
      .input(
        z.object({
          fileContent: z.string(),
          fileName: z.string(),
          mimeType: z.string(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const tempFilePath = path.join(os.tmpdir(), input.fileName);
        await fs.promises.writeFile(
          tempFilePath,
          Buffer.from(input.fileContent, 'base64'),
        );
        try {
          return await uploadFile(
            '',
            {
              originalFilename: input.fileName,
              filepath: tempFilePath,
              mimetype: input.mimeType,
            },
            ctx.models,
            false,
            true,
          );
        } finally {
          await fs.promises
            .unlink(tempFilePath)
            .catch(() => Promise.resolve(undefined));
        }
      }),
  }),
});

import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { IModels } from '../modules/storage/db/models/Storage';
import { setAccountingResult } from '../modules/storage/services/movementService';

export type StorageTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<StorageTRPCContext>().create();

export const appRouter = t.router({
  movements: t.router({
    /** accounting_api reports whether it booked a movement. */
    setAccountingResult: t.procedure
      .input(
        z.object({
          movementId: z.string().min(1),
          status: z.enum(['success', 'error']),
          message: z.string().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        await setAccountingResult(ctx.models, {
          movementId: input.movementId,
          status: input.status,
          message: input.message,
        });
        return { ok: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

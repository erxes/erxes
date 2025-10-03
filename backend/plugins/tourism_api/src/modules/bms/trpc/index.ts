import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { TourismTRPCContext } from '~/trpc/init-trpc';

const t = initTRPC.context<TourismTRPCContext>().create();

export const branchRouter = t.router({
  branch: t.router({
    count: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      try {
        const { query = {}, options } = input;
        const { models } = ctx;

        const count = await models.Branches.find(query)
          .skip(options?.skip || 0)
          .limit(options?.limit || 0) // 0 means no limit
          .countDocuments();

        return {
          status: 'success',
          data: count,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error('Count documents error:', error);

        return {
          status: 'error',
          message: 'Failed to count documents',
          ...(process.env.NODE_ENV === 'development' && {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
          }),
        };
      }
    }),
  }),
});

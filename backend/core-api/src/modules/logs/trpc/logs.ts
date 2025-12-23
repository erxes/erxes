import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const logsRouter = t.router({
  log: t.router({
    list: t.procedure.input(z.any()).query(async ({ input, ctx }) => {
      const { ...query } = input;
      const { models, userId } = ctx;
      if (!userId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const logs = await models.Logs.find({ ...query });

      return logs;
    }),

    get: t.procedure.query(async () => {
      return null;
    }),
  }),
});

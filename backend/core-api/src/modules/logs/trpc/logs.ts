import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const logsRouter = t.router({
  log: t.router({
    list: t.procedure
      .meta({
        agent: {
          description:
            'List system/audit logs with a MongoDB-style filter, e.g. { targetId: "recordId" } to see what happened to one record, or { processId: "..." } to see every change made by one operation/request. Use to audit history and trace what changed, when, and by whom.',
          permission: { module: 'logs', action: 'logsRead' },
        },
      })
      .input(z.any())
      .query(async ({ input, ctx }) => {
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

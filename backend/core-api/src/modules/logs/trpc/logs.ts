import { initTRPC, TRPCError } from '@trpc/server';
import { Types } from 'mongoose';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';
import { agentMeta } from '~/utils/agentMeta';

const t = initTRPC.context<CoreTRPCContext>().create();

export const logsRouter = t.router({
  log: t.router({
    list: t.procedure
      .meta(
        agentMeta(
          'List system/audit logs with a MongoDB-style filter, e.g. { targetId: "recordId" } to see what happened to one record, or { processId: "..." } to see every change made by one operation/request. Use to audit history and trace what changed, when, and by whom.',
          { module: 'logs', action: 'logsRead' },
        ),
      )
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

    get: t.procedure
      .meta(
        agentMeta(
          'Get one system/audit log entry by _id. Input: { _id }. Returns the full log document (action, target, payload diff, who made the change and when). Resolve ids with log.list first.',
          { module: 'logs', action: 'logsRead' },
        ),
      )
              .input(
          z.object({
            _id: z
              .string()
              .refine(Types.ObjectId.isValid, 'Invalid log id'),
          }),
        )
      .query(async ({ input, ctx }) => {
        const { models, userId } = ctx;

        if (!userId) {
          throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        return models.Logs.findOne({ _id: input._id }).lean();
      }),
  }),
});

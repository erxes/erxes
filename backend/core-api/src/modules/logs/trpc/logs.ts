import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { IContext } from '~/connectionResolvers';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const logsRouter = t.router({
  log: t.router({
    list: t.procedure.input(z.any()).query(async ({ input, ctx }) => {
      const { ...query } = input;
      const { models } = ctx;
      const logs = await models.Logs.find({ ...query });

      return logs;
    }),

    get: t.procedure.query(async () => {
      return null;
    }),
  }),
});

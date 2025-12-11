import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const broadcastRouter = t.router({
  broadcast: t.router({
    list: t.procedure.input(z.any()).query(async ({ input, ctx }) => {
      return [];
    }),

    get: t.procedure.query(async () => {
      return null;
    }),
  }),
});

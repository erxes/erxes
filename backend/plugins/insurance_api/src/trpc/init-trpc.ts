import { initTRPC } from '@trpc/server';

import { ITRPCContext } from 'erxes-api-shared/utils';

const t = initTRPC.context<ITRPCContext>().create();

export const appRouter = t.router({
  insurance: t.router({
    health: t.procedure.query(() => {
      return { status: 'ok', service: 'insurance' };
    }),
  }),
});

export type AppRouter = typeof appRouter;

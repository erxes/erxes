import { initTRPC } from '@trpc/server';

import { ITRPCContext } from 'erxes-api-shared/utils';

const t = initTRPC.context<ITRPCContext>().create();

export const appRouter = t.router({
  insurance: {
    hello: t.procedure.query(() => {
      return 'Hello insurance';
    }),
  },
});

export type AppRouter = typeof appRouter;

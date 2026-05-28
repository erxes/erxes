import { initTRPC } from '@trpc/server';

import { ITRPCContext } from 'erxes-api-shared/utils';

const t = initTRPC.context<ITRPCContext>().create();

export const appRouter = t.router({
  agentAssistant: t.router({
    list: t.procedure.query(() => {
      return [];
    }),
  }),
});

export type AppRouter = typeof appRouter;

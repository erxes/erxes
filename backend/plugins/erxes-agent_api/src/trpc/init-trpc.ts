import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';

const t = initTRPC.context<ITRPCContext>().create();

export const appRouter = t.router({
  mastra: {
    hello: t.procedure.query(() => 'Hello from erxes-agent_api'),
  },
});

export type AppRouter = typeof appRouter;

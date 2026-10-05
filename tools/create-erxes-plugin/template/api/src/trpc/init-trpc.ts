import { initTRPC } from '@trpc/server';

interface ITRPCContext {
  subdomain: string;
  models: unknown;
  [key: string]: unknown;
}

export const createTRPCContext = async (
  subdomain: string,
  context: ITRPCContext,
): Promise<ITRPCContext> => ({
  ...context,
  subdomain,
});

const t = initTRPC.context<ITRPCContext>().create();

/**
 * Procedures here are callable service-to-service over POST /trpc. Add
 * `.meta({ agent: { permission: '<action>' } })` to expose a procedure as an
 * agent tool once the contract's agent-tools endpoint is wired.
 */
export const appRouter = t.router({
  changemodule: t.router({
    itemFind: t.procedure.query(async () => {
      return { items: [] };
    }),
  }),
});

export type AppRouter = typeof appRouter;

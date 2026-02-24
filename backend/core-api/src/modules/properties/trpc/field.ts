import { initTRPC } from '@trpc/server';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const fieldTrpcRouter = t.router({
  fields: t.router({}),
});

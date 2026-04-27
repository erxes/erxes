import { initTRPC } from '@trpc/server';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const groupTrpcRouter = t.router({
  groups: t.router({}),
});

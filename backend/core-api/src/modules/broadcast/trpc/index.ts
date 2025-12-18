import { initTRPC } from '@trpc/server';
import { CoreTRPCContext } from '~/init-trpc';
import { broadcastRouter } from './broadcast';

const t = initTRPC.context<CoreTRPCContext>().create();

export const appRouter = t.mergeRouters(broadcastRouter);

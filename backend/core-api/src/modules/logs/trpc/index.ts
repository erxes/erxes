import { initTRPC } from '@trpc/server';
import { CoreTRPCContext } from '~/init-trpc';
import { logsRouter } from './logs';

const t = initTRPC.context<CoreTRPCContext>().create();

export const appRouter = t.mergeRouters(logsRouter);

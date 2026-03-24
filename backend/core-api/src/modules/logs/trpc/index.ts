import { initTRPC } from '@trpc/server';
import { CoreTRPCContext } from '~/init-trpc';
import { logsRouter } from './logs';
import { activityLogRouter } from './activityLog';

const t = initTRPC.context<CoreTRPCContext>().create();

export const logsTrpcRouter = t.mergeRouters(logsRouter, activityLogRouter);

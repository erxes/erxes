import { initTRPC } from '@trpc/server';
import { CoreTRPCContext } from '~/init-trpc';
import { logsRouter } from './logs';
import { activityLogRouter } from './activityLog';
import { revertTrpcRouter } from '../revert/trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const logsTrpcRouter = t.mergeRouters(
  logsRouter,
  activityLogRouter,
  revertTrpcRouter,
);

import { initTRPC } from '@trpc/server';

import { CoreTRPCContext } from '~/init-trpc';
import { cpNotificationTrpcRouter } from '@/clientportal/trpc/notifications';
import { cpUsersTrpcRouter } from '@/clientportal/trpc/cpUsers';

const t = initTRPC.context<CoreTRPCContext>().create();

export const clientPortalNotificationTrpcRouter = t.mergeRouters(
  cpNotificationTrpcRouter,
  cpUsersTrpcRouter,
);

import { initTRPC } from '@trpc/server';

import { ITRPCContext } from 'erxes-api-shared/utils';
import { ebarimtTrpcRouter } from '../modules/ebarimt/trpc';

const t = initTRPC.context<ITRPCContext>().create();

export const appRouter = t.mergeRouters(ebarimtTrpcRouter);

export type AppRouter = typeof appRouter;

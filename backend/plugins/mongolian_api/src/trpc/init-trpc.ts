import { initTRPC } from '@trpc/server';

import { ITRPCContext } from 'erxes-api-shared/utils';
import { ebarimtTrpcRouter } from '../modules/ebarimt/trpc';
import { productPlacesTrpcRouter } from '../modules/productplaces/trpc/productPlaces';


const t = initTRPC.context<ITRPCContext>().create();

export const appRouter = t.mergeRouters(
  ebarimtTrpcRouter,
  productPlacesTrpcRouter
);

export type AppRouter = typeof appRouter;

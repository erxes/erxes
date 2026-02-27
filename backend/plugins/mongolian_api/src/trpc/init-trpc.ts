import { initTRPC } from '@trpc/server';

import { ITRPCContext } from 'erxes-api-shared/utils';
import { ebarimtTrpcRouter } from '../modules/ebarimt/trpc';
import { productPlacesTrpcRouter } from '~/modules/productPlaces/trpc/productPlaces';
import { configsTrpcRouter } from '~/modules/configs/trpc/configs'; 

const t = initTRPC.context<ITRPCContext>().create();

export const appRouter = t.router({
  ebarimt: ebarimtTrpcRouter,
  productPlaces: productPlacesTrpcRouter,
  configs: configsTrpcRouter,
});
console.log('🔍 tRPC routes:', Object.keys(appRouter));

export type AppRouter = typeof appRouter;

import { initTRPC } from '@trpc/server';

import { ITRPCContext } from 'erxes-api-shared/utils';
import { ebarimtTrpcRouter } from '../modules/ebarimt/trpc';
import { productPlacesTrpcRouter } from '~/modules/productPlaces/trpc/productPlaces';
import { exchangeRateTrpcRouter } from '~/modules/exchangeRates/trpc/exchangeRate';

const t = initTRPC.context<ITRPCContext>().create();

export const appRouter = t.mergeRouters(
  ebarimtTrpcRouter,
  productPlacesTrpcRouter,
  exchangeRateTrpcRouter
);

export type AppRouter = typeof appRouter;

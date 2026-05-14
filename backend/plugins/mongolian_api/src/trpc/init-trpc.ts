import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { configsTrpcRouter } from '~/modules/configs/trpc/configs';
import { erkhetTrpcRouter } from '~/modules/erkhet/trpc/erkhet';
import { exchangeRateTrpcRouter } from '~/modules/exchangeRates/trpc/exchangeRate';
import { productPlacesTrpcRouter } from '~/modules/productPlaces/trpc/productPlaces';
import { ebarimtTrpcRouter } from '../modules/ebarimt/trpc';

const t = initTRPC.context<ITRPCContext>().create();

export const appRouter = t.mergeRouters(
  configsTrpcRouter,
  exchangeRateTrpcRouter,
  ebarimtTrpcRouter,
  productPlacesTrpcRouter,
  erkhetTrpcRouter,
);

export type AppRouter = typeof appRouter;

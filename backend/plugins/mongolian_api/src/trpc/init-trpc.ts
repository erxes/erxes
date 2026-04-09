import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { ebarimtTrpcRouter } from '../modules/ebarimt/trpc';
import { productPlacesTrpcRouter } from '~/modules/productPlaces/trpc/productPlaces';
import { configsTrpcRouter } from '~/modules/configs/trpc/configs';
import { exchangeRateTrpcRouter } from '~/modules/exchangeRates/trpc/exchangeRate';
import { erkhetTrpcRouter } from '~/modules/erkhet/trpc/erkhet';

const t = initTRPC.context<ITRPCContext>().create();

export const appRouter = t.mergeRouters(
  ebarimtTrpcRouter,
  productPlacesTrpcRouter,
  configsTrpcRouter,
  exchangeRateTrpcRouter,
  erkhetTrpcRouter,
);

export type AppRouter = typeof appRouter;

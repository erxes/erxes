import { initTRPC } from '@trpc/server';

import { productCategoryTrpcRouter } from '@/products/trpc/category';
import { productConfigTrpcRouter } from '@/products/trpc/config';
import { productsTrpcRouter } from '@/products/trpc/product';
import { uomTrpcRouter } from '@/products/trpc/uom';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const productTrpcRouter = t.mergeRouters(
  productsTrpcRouter,
  uomTrpcRouter,
  productCategoryTrpcRouter,
  productConfigTrpcRouter,
);

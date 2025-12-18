import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { IModels } from '~/connectionResolvers';
import { afterMutationHandlers } from '../afterMutations';
import { beforeResolverHandlers } from '../beforeResolvers';

export type ProductPlacesTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<ProductPlacesTRPCContext>().create();

export const productPlacesTrpcRouter = t.router({
  productPlaces: {
    afterMutation: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;
        return await afterMutationHandlers(subdomain, input);
      }),

    beforeResolver: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;
        return await beforeResolverHandlers(models, subdomain, input);
      }),
  },
});
import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { IModels } from '~/connectionResolvers';

export type EbarimtTRPCContext = ITRPCContext<{ models: IModels }>;

export const t = initTRPC.context<EbarimtTRPCContext>().create();

export const productRulesTrpcRouter = t.router({
  productRules: {
    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      const { data } = input;
      return await models.ProductRules.find(data).lean();
    }),
  },
});

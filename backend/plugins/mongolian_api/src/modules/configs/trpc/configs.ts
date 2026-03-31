import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

export type ConfigsTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<ConfigsTRPCContext>().create();

export const configsTrpcRouter = t.router({
  mnConfig: t.procedure
    .input(z.object({ code: z.string(), subId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const { models } = ctx;
      const { code, subId } = input;

      // Count documents with the query
      const count = await models.Configs.countDocuments({ code, subId });

      // If count > 0, try to find one
      if (count > 0) {
        const config = await models.Configs.findOne({ code, subId }).lean();
        if (config) console.log('config:', config);
        return config;
      } else {
        return null;
      }
    }),
});

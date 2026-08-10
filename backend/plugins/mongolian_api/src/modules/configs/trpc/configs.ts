import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

export type ConfigsTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<ConfigsTRPCContext>().create();

export const configsTrpcRouter = t.router({
  mnConfigs: t.router({
    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const {
        query
      } = input;
      const { models } = ctx;
      return await models.Configs.find(query);
    }),
    getConfig: t.procedure
      .input(z.object({ code: z.string(), subId: z.string().optional() }))
      .query(async ({ input, ctx }) => {
        const { models } = ctx;
        const { code, subId } = input;

        const configs = await models.Configs.find({ code, subId });

        if (!configs?.length) {
          return null;
        }

        return configs[0];
      }),
  }),
});

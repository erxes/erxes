import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { getFileUploadConfigs } from '@/organization/settings/utils/configs';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const configTrpcRouter = t.router({
  configs: t.router({
    findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { query } = input;
      const { models } = ctx;

      return await models.Configs.findOne(query).lean();
    }),
    getConfig: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { code, defaultValue } = input;
      const { models } = ctx;
      return await models.Configs.getConfigValue(code, defaultValue);
    }),
    getConfigs: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { codes } = input;
      const { models } = ctx;
      return await models.Configs.getConfigs(codes);
    }),
    getValues: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      const { query } = input;
      return await models.Configs.find(query).distinct('value');
    }),
    getFileUploadConfigs: t.procedure.input(z.any()).query(async () => {
      return await getFileUploadConfigs();
    }),
    createOrUpdateConfig: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { data } = input;
        const { models } = ctx;

        return await models.Configs.createOrUpdateConfig(data);
      }),
  }),
});

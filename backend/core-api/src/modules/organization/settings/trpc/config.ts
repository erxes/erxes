import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { getFileUploadConfigs } from '@/organization/settings/utils/configs';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const configTrpcRouter = t.router({
  configs: t.router({
    findOne: t.procedure
      .input(z.object({ query: z.any() }))
      .query(async ({ ctx, input }) => {
        const { query } = input;
        const { models } = ctx;

        return await models.Configs.findOne(query).lean();
      }),
    getConfig: t.procedure
      .input(z.object({ code: z.string(), defaultValue: z.any() }))
      .query(async ({ ctx, input }) => {
        const { code, defaultValue } = input;
        const { models } = ctx;
        return await models.Configs.getConfigValue(code, defaultValue);
      }),
    getConfigs: t.procedure
      .input(z.object({ codes: z.array(z.string()) }))
      .query(async ({ ctx, input }) => {
        const { codes } = input;
        const { models } = ctx;
        return await models.Configs.getConfigs(codes);
      }),
    getValues: t.procedure
      .input(z.object({ query: z.any() }))
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        const { query } = input;
        return await models.Configs.find(query).distinct('value');
      }),
    getFileUploadConfigs: t.procedure.input(z.object({})).query(async () => {
      return await getFileUploadConfigs();
    }),
    createOrUpdateConfig: t.procedure
      .input(z.object({ data: z.object({ code: z.string(), value: z.any() }) }))
      .mutation(async ({ ctx, input }) => {
        const { data } = input;
        const { models } = ctx;

        return await models.Configs.createOrUpdateConfig(data);
      }),
  }),
});

import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';
import { agentMeta } from '~/utils/agentMeta';

const t = initTRPC.context<CoreTRPCContext>().create();

export const productConfigTrpcRouter = t.router({
  productConfigs: t.router({
    getConfig: t.procedure
      .meta(
        agentMeta(
          'Read a product module configuration value by code: { code, defaultValue? }. Returns defaultValue when the config is not set. Product-related settings only.',
          { module: 'products', action: 'productsRead' },
        ),
      )
      .input(z.any())
      .query(async ({ ctx, input }) => {
      const { code, defaultValue } = input;
      const { models } = ctx;

      return models.ProductsConfigs.getConfig(code, defaultValue);
    }),
  }),
});

import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const brandTrpcRouter = t.router({
  brands: t.router({
    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { query } = input;
      const { models } = ctx;

      return await models.Brands.find(query);
    }),
    findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const query = input?.query || input?.selector || input;
      const { models } = ctx;

      if (!query || !Object.keys(query).length) {
        return {};
      }

      return await models.Brands.findOne(query);
    }),
    create: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { data } = input;
      const { models } = ctx;

      return await models.Brands.createBrand(data);
    }),
    updateOne: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { _id, fields } = input;
      const { models } = ctx;

      if (!_id) {
        return {};
      }

      return await models.Brands.updateBrand(_id, fields);
    }),
  }),
});

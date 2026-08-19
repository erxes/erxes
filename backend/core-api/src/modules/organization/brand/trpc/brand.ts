import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const brandTrpcRouter = t.router({
  brands: t.router({
    find: t.procedure
      .meta({
        agent: {
          description:
            'List brands: { query? }. Brands group channels/integrations (messenger, forms, etc.). Use to resolve a brand name to its _id.',
          permission: { module: 'brands', action: 'brandsRead' },
        },
      })
      .input(z.any())
      .query(async ({ ctx, input }) => {
      const { query } = input;
      const { models } = ctx;

      return await models.Brands.find(query);
    }),
    findOne: t.procedure
      .meta({
        agent: {
          description:
            'Get a single brand by { _id }, { code }, or any MongoDB-style query. Returns {} when nothing matches. Call before brands.updateOne.',
          permission: { module: 'brands', action: 'brandsRead' },
        },
      })
      .input(z.any())
      .query(async ({ ctx, input }) => {
      const query = input?.query || input?.selector || input;
      const { models } = ctx;

      if (!query || !Object.keys(query).length) {
        return {};
      }

      return await models.Brands.findOne(query);
    }),
    create: t.procedure
      .meta({
        agent: {
          description:
            'Create a brand. Input: { data: { name, code, description? } } — code must be unique. Check for an existing brand with brands.find first.',
          permission: { module: 'brands', action: 'brandsCreate' },
        },
      })
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
      const { data } = input;
      const { models } = ctx;

      return await models.Brands.createBrand(data);
    }),
    updateOne: t.procedure
      .meta({
        agent: {
          description:
            'Update a brand by ID. Input: { _id, fields: { name?, code?, description?, ... } }. Call brands.findOne first to get the _id.',
          permission: { module: 'brands', action: 'brandsUpdate' },
        },
      })
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
      const { _id, fields } = input;
      const { models } = ctx;

      if (!_id) {
        return {};
      }

      return await models.Brands.updateBrand(_id, fields);
    }),
  }),
});

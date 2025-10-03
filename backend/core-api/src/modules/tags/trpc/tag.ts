import { initTRPC } from '@trpc/server';
import { escapeRegExp } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const tagTrpcRouter = t.router({
  tags: t.router({
    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { query } = input;
      const { models } = ctx;

      return await models.Tags.find(query).lean();
    }),

    findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { query } = input;
      const { models } = ctx;

      return await models.Tags.findOne(query);
    }),

    findWithChild: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { query, fields } = input;
      const { models } = ctx;

      const tags = await models.Tags.find(query).lean();

      if (!tags.length) {
        return [];
      }

      const orderQry: any[] = [];
      for (const tag of tags) {
        orderQry.push({
          order: { $regex: new RegExp(`^${escapeRegExp(tag.order || '')}`) },
        });
      }

      return await models.Tags.find(
        {
          $or: orderQry,
        },
        fields || {},
      )
        .sort({ order: 1 })
        .lean();
    }),
    create: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { data } = input;
      const { models } = ctx;

      return await models.Tags.createTag(data);
    }),
  }),
});

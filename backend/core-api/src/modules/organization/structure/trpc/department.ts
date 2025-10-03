import { initTRPC } from '@trpc/server';
import { escapeRegExp } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const departmentTrpcRouter = t.router({
  departments: t.router({
    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      const { query, fields } = input;

      return await models.Departments.find(query, fields).lean();
    }),

    findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { query } = input;
      const { models } = ctx;

      return await models.Departments.findOne(query).lean();
    }),

    findWithChild: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { query, fields } = input;
      const { models } = ctx;

      const departments = await models.Departments.find(query);

      if (!departments.length) {
        return [];
      }

      const orderQry: any[] = [];

      for (const tag of departments) {
        orderQry.push({
          order: { $regex: new RegExp(`^${escapeRegExp(tag.order || '')}`) },
        });
      }

      return await models.Departments.find(
        {
          $or: orderQry,
        },
        fields,
      )
        .sort({ order: 1 })
        .lean();
    }),
  }),
});

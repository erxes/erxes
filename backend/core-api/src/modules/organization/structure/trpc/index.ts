import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';
import {
  activeMembershipFilter,
  getUserStructureContext,
  orderPrefixFilter,
} from '../utils';

const t = initTRPC.context<CoreTRPCContext>().create();

export const structureTrpcRouter = t.router({
  structureEntities: t.router({
    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { query = {}, fields } = input || {};

      return ctx.models.StructureEntities.find(query, fields).lean();
    }),

    findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const query = input?.query || input;

      if (!query || !Object.keys(query).length) {
        return null;
      }

      return ctx.models.StructureEntities.findOne(query).lean();
    }),

    findWithDescendants: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { query = {}, fields } = input || {};
        const nodes = await ctx.models.StructureEntities.find(query, {
          order: 1,
        }).lean();

        if (!nodes.length) {
          return [];
        }

        return ctx.models.StructureEntities.find(
          orderPrefixFilter(nodes.map((node) => node.order)),
          fields,
        )
          .sort({ order: 1 })
          .lean();
      }),

    root: t.procedure.query(async ({ ctx }) =>
      ctx.models.StructureEntities.getRoot(),
    ),

    userContext: t.procedure
      .input(z.object({ userId: z.string() }))
      .query(async ({ ctx, input }) =>
        getUserStructureContext(ctx.models, input.userId),
      ),
  }),

  structureEntityMembers: t.router({
    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { query = {}, activeOnly = true } = input || {};

      return ctx.models.StructureEntityMembers.find({
        ...query,
        ...(activeOnly ? activeMembershipFilter() : {}),
      }).lean();
    }),
  }),
});

import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const roleTrpcRouter = t.router({
  roles: t.router({
    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      const { query } = input;

      return models.Roles.find(query);
    }),
    findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      const { userId } = input;

      return await models.Roles.getRole(userId);
    }),
  }),
});

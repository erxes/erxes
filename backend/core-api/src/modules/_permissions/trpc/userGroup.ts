import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const userGroupTrpcRouter = t.router({
  userGroups: t.router({
    getIds: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      const { query } = input;

      return await models.UsersGroups.find(query).distinct('_id');
    }),
  }),
});

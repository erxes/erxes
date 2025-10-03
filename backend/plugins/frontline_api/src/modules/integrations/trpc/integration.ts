import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { FrontlineTRPCContext } from '~/init-trpc';

const t = initTRPC.context<FrontlineTRPCContext>().create();

export const integrationTrpcRouter = t.router({
  integration: t.router({
    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { query } = input;
      const { models } = ctx;

      return models.Integrations.find(query).lean();
    }),
  }),
});

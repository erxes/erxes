import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { FrontlineTRPCContext } from '~/init-trpc';
import { templates } from '~/meta/templates';

const t = initTRPC.context<FrontlineTRPCContext>().create();

export const formTrpcRouter = t.router({
  form: t.router({
    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { query } = input;
      const { models } = ctx;

      return models.Forms.find(query).lean();
    }),

    template: t.router({
      getContent: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
          const { template, collectionName } = input;
          const { models } = ctx;

          const { modules } = templates || {};

          return await modules['form'][collectionName].getContent({ template, models }) || null;
      }),
      setContent: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
          const { template, user, collectionName } = input;
          const { models } = ctx;

          const { modules } = templates || {};

          return await modules['form'][collectionName].setContent({ template, models, user }) || null;
      })
    })
  }),

  
});

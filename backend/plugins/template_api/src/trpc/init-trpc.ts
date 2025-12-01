import { initTRPC } from '@trpc/server';
import { z } from 'zod';

import { ITRPCContext } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

export type TemplateTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<TemplateTRPCContext>().create();

export const appRouter = t.router({
  templates: {
    add: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      const { doc } = input;

      try {
        const template = await models.Template.createTemplate(doc);
        return {
          status: 'success',
          data: template,
          _id: template._id,
        };
      } catch (error) {
        return {
          status: 'error',
          errorMessage: error.message,
        };
      }
    }),
  },
});

export type AppRouter = typeof appRouter;

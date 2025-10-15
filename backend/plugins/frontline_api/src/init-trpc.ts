import { initTRPC } from '@trpc/server';

import { ITRPCContext } from 'erxes-api-shared/utils';

import { z } from 'zod';
import { generateFacebookFields } from '@/integrations/facebook/fieldUtils';
import { IModels } from './connectionResolvers';
import { conversationTrpcRouter } from './modules/inbox/trpc/conversation';
import { inboxTrpcRouter } from './modules/inbox/trpc/inbox';
import { integrationTrpcRouter } from './modules/integrations/trpc/integration';

export type FrontlineTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<FrontlineTRPCContext>().create();

export const appRouter = t.mergeRouters(
  integrationTrpcRouter,
  inboxTrpcRouter,
  conversationTrpcRouter,
  t.router({
    fields: t.router({
      getFieldList: t.procedure
        .input(
          z.object({
            moduleType: z.string(),
            collectionType: z.string().optional(),
            segmentId: z.string().optional(),
            usageType: z.string().optional(),
            config: z.record(z.any()).optional(),
          }),
        )
        .query(async ({ ctx, input }) => {
          const { models } = ctx;
          const { moduleType } = input;
          if (moduleType === 'facebook') {
            return await generateFacebookFields(models, input);
          }

          return [];
        }),
    }),
  }),
);

export type AppRouter = typeof appRouter;

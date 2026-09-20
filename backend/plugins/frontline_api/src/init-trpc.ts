import { initTRPC } from '@trpc/server';

import { ITRPCContext } from 'erxes-api-shared/utils';

import { z } from 'zod';
import { generateFacebookFields } from '@/integrations/facebook/fieldUtils';
import { IModels } from './connectionResolvers';
import { conversationTrpcRouter } from './modules/inbox/trpc/conversation';
import { formTrpcRouter } from './modules/form/trpc/form';
import { relationTrpcRouter } from './modules/inbox/trpc/relation';
import { inboxTrpcRouter } from './modules/inbox/trpc/inbox';
import { integrationTrpcRouter } from './modules/integrations/trpc/integration';
import { ticketTrpcRouter } from './modules/ticket/trpc/ticket';
import { generateTicketFields } from './modules/ticket/meta/fields/fieldUtils';
import { getTicketFieldOptionUsedValues } from './modules/ticket/utils/fieldOptionUsedValues';
import { TICKET_PROPERTY_CONTENT_TYPE } from './modules/ticket/utils/ticketConfig';

export type FrontlineTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<FrontlineTRPCContext>().create();

export const appRouter = t.mergeRouters(
  integrationTrpcRouter,
  inboxTrpcRouter,
  conversationTrpcRouter,
  formTrpcRouter,
  ticketTrpcRouter,
  relationTrpcRouter,
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
          const { models, subdomain } = ctx;
          const { moduleType } = input;
          if (moduleType === 'facebook') {
            return await generateFacebookFields(models, subdomain, input);
          }
          if (moduleType === 'tickets') {
            return await generateTicketFields({ subdomain, data: input });
          }

          return [];
        }),

      fieldOptionUsedValues: t.procedure
        .input(
          z.object({
            contentType: z.string(),
            fieldId: z.string(),
            values: z.array(z.string()),
          }),
        )
        .query(({ ctx, input }) => {
          const { models } = ctx;
          const { contentType, fieldId, values } = input;

          if (contentType !== TICKET_PROPERTY_CONTENT_TYPE) {
            return null;
          }

          return getTicketFieldOptionUsedValues(models, fieldId, values);
        }),
    }),
  }),
);

export type AppRouter = typeof appRouter;

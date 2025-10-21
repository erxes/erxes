import { initializePluginConfig } from '../../utils';
import { createTRPCContext } from '../../utils/trpc';
import {
  AutomationConfigs,
  IAutomationContext,
  TAutomationProducers,
} from './types';
import { Express } from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { AnyProcedure, initTRPC } from '@trpc/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';

export const startAutomations = async (
  app: Express,
  pluginName: string,
  config: AutomationConfigs,
) => {
  await initializePluginConfig(pluginName, 'automations', config);
  const t = initTRPC.context<IAutomationContext>().create();

  const {
    receiveActions,
    getRecipientsEmails,
    replacePlaceHolders,
    checkCustomTrigger,
  } = config || {};

  const automationProcedures: Partial<
    Record<TAutomationProducers, AnyProcedure>
  > = {};

  if (receiveActions) {
    automationProcedures[TAutomationProducers.RECEIVE_ACTIONS] = t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => receiveActions(ctx, input));
  }

  if (getRecipientsEmails) {
    automationProcedures[TAutomationProducers.GET_RECIPIENTS_EMAILS] =
      t.procedure
        .input(z.any())
        .mutation(async ({ ctx, input }) => getRecipientsEmails(ctx, input));
  }

  if (replacePlaceHolders) {
    automationProcedures[TAutomationProducers.REPLACE_PLACEHOLDERS] =
      t.procedure
        .input(z.any())
        .mutation(async ({ ctx, input }) => replacePlaceHolders(ctx, input));
  }

  if (checkCustomTrigger) {
    automationProcedures[TAutomationProducers.CHECK_CUSTOM_TRIGGER] =
      t.procedure
        .input(z.any())
        .mutation(async ({ ctx, input }) => checkCustomTrigger(ctx, input));
  }

  const automationsRouter = t.router(automationProcedures);

  const trpcMiddleware = trpcExpress.createExpressMiddleware({
    router: automationsRouter,
    createContext: createTRPCContext<IAutomationContext>(
      async (_subdomain, context) => {
        const processId = nanoid(12);

        context.processId = processId;

        return context;
      },
    ),
  });

  app.use('/automations', trpcMiddleware);
};

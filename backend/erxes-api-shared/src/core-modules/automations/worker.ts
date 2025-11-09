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

const BaseInput = z.object({
  subdomain: z.string(),
  data: z.any().optional(),
});

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
    checkCustomTrigger,
    replacePlaceHolders,
    getAdditionalAttributes,
  } = config || {};

  const automationProcedures: Partial<
    Record<TAutomationProducers, AnyProcedure>
  > = {};

  if (receiveActions) {
    automationProcedures[TAutomationProducers.RECEIVE_ACTIONS] = t.procedure
      .input(BaseInput)
      .mutation(async ({ ctx, input }) =>
        receiveActions({ subdomain: input.subdomain, data: input.data }, ctx),
      );
  }

  if (getRecipientsEmails) {
    automationProcedures[TAutomationProducers.GET_RECIPIENTS_EMAILS] =
      t.procedure
        .input(BaseInput)
        .mutation(async ({ ctx, input }) =>
          getRecipientsEmails(
            { subdomain: input.subdomain, data: input.data },
            ctx,
          ),
        );
  }

  if (getAdditionalAttributes) {
    automationProcedures[TAutomationProducers.GET_ADDITIONAL_ATTRIBUTES] =
      t.procedure
        .input(BaseInput)
        .mutation(async ({ ctx, input }) =>
          getAdditionalAttributes(
            { subdomain: input.subdomain, data: input.data },
            ctx,
          ),
        );
  }

  if (replacePlaceHolders) {
    automationProcedures[TAutomationProducers.REPLACE_PLACEHOLDERS] =
      t.procedure
        .input(BaseInput)
        .mutation(async ({ ctx, input }) =>
          replacePlaceHolders(
            { subdomain: input.subdomain, data: input.data },
            ctx,
          ),
        );
  }

  if (checkCustomTrigger) {
    automationProcedures[TAutomationProducers.CHECK_CUSTOM_TRIGGER] =
      t.procedure
        .input(BaseInput)
        .mutation(async ({ ctx, input }) =>
          checkCustomTrigger(
            { subdomain: input.subdomain, data: input.data },
            ctx,
          ),
        );
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

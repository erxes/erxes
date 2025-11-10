import { AnyProcedure, initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { Express } from 'express';
import { nanoid } from 'nanoid';
import { initializePluginConfig } from '../../utils';
import { createTRPCContext } from '../../utils/trpc';
import {
  AutomationConfigs,
  IAutomationContext,
  TAutomationProducers,
} from './types';
import {
  BaseInput,
  CheckCustomTriggerInput,
  ReceiveActionsInput,
  ReplacePlaceholdersInput,
  SetPropertiesInput,
} from './zodTypes';

export const startAutomations = async (
  app: Express,
  pluginName: string,
  config: AutomationConfigs,
) => {
  await initializePluginConfig(pluginName, 'automations', config);
  const t = initTRPC.context<IAutomationContext>().create();

  const {
    receiveActions,
    setProperties,
    checkCustomTrigger,
    replacePlaceHolders,
    getAdditionalAttributes,
  } = config || {};

  const automationProcedures: Partial<
    Record<TAutomationProducers, AnyProcedure>
  > = {};

  if (receiveActions) {
    automationProcedures[TAutomationProducers.RECEIVE_ACTIONS] = t.procedure
      .input(ReceiveActionsInput)
      .mutation(async ({ ctx, input }) => receiveActions(input, ctx));
  }

  if (setProperties) {
    automationProcedures[TAutomationProducers.SET_PROPERTIES] = t.procedure
      .input(SetPropertiesInput)
      .mutation(async ({ ctx, input }) => setProperties(input, ctx));
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
        .input(ReplacePlaceholdersInput)
        .mutation(async ({ ctx, input }) => replacePlaceHolders(input, ctx));
  }

  if (checkCustomTrigger) {
    automationProcedures[TAutomationProducers.CHECK_CUSTOM_TRIGGER] =
      t.procedure
        .input(CheckCustomTriggerInput)
        .mutation(async ({ ctx, input }) => checkCustomTrigger(input, ctx));
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

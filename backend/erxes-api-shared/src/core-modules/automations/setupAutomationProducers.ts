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
  AutomationBaseInput,
  CheckCustomTriggerInput,
  FindObjectInput,
  CheckTargetMatchInput,
  GenerateAiContextInput,
  ReceiveActionsInput,
  TAutomationProducersInput,
  ResolveOutputPathsInput,
  ReplacePlaceholdersInput,
  SetPropertiesInput,
} from './zodTypes';
import {
  buildRuntimeOutputsIndex,
  normalizeAutomationConstantsForTransport,
  resolveOutputValues,
} from './outputResolvers';

export const startAutomations = async (
  app: Express,
  pluginName: string,
  config: AutomationConfigs,
) => {
  const runtimeOutputs = buildRuntimeOutputsIndex(pluginName, config.constants);
  const transportConfig = {
    ...config,
    constants: normalizeAutomationConstantsForTransport(
      pluginName,
      config.constants,
    ),
  };

  await initializePluginConfig(pluginName, 'automations', transportConfig);
  const t = initTRPC.context<IAutomationContext>().create();

  const {
    receiveActions,
    setProperties,
    checkCustomTrigger,
    checkTargetMatch,
    findObject,
    replacePlaceHolders,
    resolveOutputPaths,
    getAdditionalAttributes,
    generateAiContext,
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
        .input(AutomationBaseInput)
        .mutation(async ({ ctx, input }) =>
          getAdditionalAttributes(
            { subdomain: input.subdomain, data: input.data },
            ctx,
          ),
        );
  }

  if (generateAiContext) {
    automationProcedures[TAutomationProducers.GENERATE_AI_CONTEXT] = t.procedure
      .input(GenerateAiContextInput)
      .mutation(async ({ ctx, input }) =>
        generateAiContext(
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

  const runtimeResolveOutputPaths =
    resolveOutputPaths ||
    (Object.keys(runtimeOutputs).length
      ? async ({
          subdomain,
          data,
        }: {
          subdomain: string;
          data: TAutomationProducersInput[TAutomationProducers.RESOLVE_OUTPUT_PATHS];
        }) => {
          const definition = runtimeOutputs[data.nodeType];

          if (!definition) {
            return {};
          }

          return resolveOutputValues({
            definition,
            subdomain,
            source: data.source || {},
            paths: data.paths || [],
            defaultValue: data.defaultValue,
          });
        }
      : undefined);

  if (runtimeResolveOutputPaths) {
    automationProcedures[TAutomationProducers.RESOLVE_OUTPUT_PATHS] =
      t.procedure
        .input(ResolveOutputPathsInput)
        .mutation(async ({ ctx, input }) =>
          runtimeResolveOutputPaths(input, ctx),
        );
  }

  if (checkCustomTrigger) {
    automationProcedures[TAutomationProducers.CHECK_CUSTOM_TRIGGER] =
      t.procedure
        .input(CheckCustomTriggerInput)
        .mutation(async ({ ctx, input }) => checkCustomTrigger(input, ctx));
  }

  if (checkTargetMatch) {
    automationProcedures[TAutomationProducers.CHECK_TARGET_MATCH] = t.procedure
      .input(CheckTargetMatchInput)
      .mutation(async ({ ctx, input }) => checkTargetMatch(input, ctx));
  }

  if (findObject) {
    automationProcedures[TAutomationProducers.FIND_OBJECT] = t.procedure
      .input(FindObjectInput)
      .mutation(async ({ ctx, input }) => findObject(input, ctx));
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

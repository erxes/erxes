import { AnyProcedure, initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { Express } from 'express';
import { nanoid } from 'nanoid';
import { initializePluginConfig } from '../../utils';
import { createTRPCContext } from '../../utils/trpc';
import { IAutomationExecution } from './definitions';
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
  SetPropertiesInput,
} from './zodTypes';
import {
  buildRuntimeOutputsIndex,
  normalizeAutomationConstantsForTransport,
  replaceOutputPlaceholders,
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
    resolveOutputPaths,
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

          const values = Object.fromEntries(
            (data.paths || []).map((path) => [path, `{{ trigger.${path} }}`]),
          );
          const execution: IAutomationExecution = {
            automationId: '',
            triggerId: '',
            triggerType: data.nodeType,
            triggerConfig: {},
            targetId: '',
            target: data.source || {},
            status: '',
            description: '',
            actions: [],
          };

          return replaceOutputPlaceholders({
            subdomain,
            execution,
            values,
            defaultValue: data.defaultValue,
            runtimeOutputs,
            keepUnresolvedPlaceholders: false,
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

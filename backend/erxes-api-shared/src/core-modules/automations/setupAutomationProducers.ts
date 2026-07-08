import { AnyProcedure, initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { Express } from 'express';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { initializePluginConfig } from '../../utils';
import { createTRPCContext } from '../../utils/trpc';
import {
  buildRuntimeOutputsIndex,
  normalizeAutomationConstantsForTransport,
  resolveOutputPathsByNodeType,
} from './outputResolvers';
import {
  AutomationConfigs,
  IAutomationContext,
  TAutomationProducers,
} from './types';
import {
  CheckCustomTriggerInput,
  CheckTargetMatchInput,
  FindObjectInput,
  GenerateAiContextInput,
  LoadAiKnowledgeDocumentBatchInput,
  LookupAiToolInput,
  ReceiveActionsInput,
  ResolveOutputPathsInput,
  SetPropertiesInput,
} from './zodTypes';

export const startAutomations = async (
  app: Express,
  pluginName: string,
  config: AutomationConfigs,
) => {
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
    generateAiContext,
    loadAiKnowledgeDocumentBatch,
    lookupAiTool,
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

  if (loadAiKnowledgeDocumentBatch) {
    automationProcedures[
      TAutomationProducers.LOAD_AI_KNOWLEDGE_DOCUMENT_BATCH
    ] = t.procedure
      .input(LoadAiKnowledgeDocumentBatchInput)
      .mutation(async ({ ctx, input }) =>
        loadAiKnowledgeDocumentBatch(input, ctx),
      );
  }

  if (lookupAiTool) {
    automationProcedures[TAutomationProducers.LOOKUP_AI_TOOL] = t.procedure
      .input(LookupAiToolInput)
      .mutation(async ({ ctx, input }) => lookupAiTool(input, ctx));
  }

  const runtimeResolveOutputPaths = generateRuntimeResolveOutputPaths(
    pluginName,
    config,
  );

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

const generateRuntimeResolveOutputPaths = (
  pluginName: string,
  config: AutomationConfigs,
) => {
  const { resolveOutputPaths, constants } = config || {};

  if (resolveOutputPaths) {
    return resolveOutputPaths;
  }

  const runtimeOutputs = buildRuntimeOutputsIndex(pluginName, constants);
  const runtimeOutputKeys = Object.keys(runtimeOutputs);

  if (!runtimeOutputKeys?.length) {
    return null;
  }
  return async (
    { subdomain, data }: z.infer<typeof ResolveOutputPathsInput>,
    _context: IAutomationContext,
  ) => {
    if (!runtimeOutputs[data.nodeType]) {
      return {};
    }

    const resolvedValues = await resolveOutputPathsByNodeType({
      subdomain,
      nodeType: data.nodeType,
      source: data.source || {},
      paths: data.paths || [],
      defaultValue: data.defaultValue,
      runtimeOutputs,
    });

    return Object.fromEntries(
      (data.paths || []).map((path) => {
        const resolvedValue = resolvedValues?.[path];

        return [
          path,
          resolvedValue === undefined ? data.defaultValue : resolvedValue,
        ];
      }),
    );
  };
};

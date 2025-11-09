import { checkServiceRunning } from '../utils';
import { ILogDoc } from '../../core-types';
import { sendWorkerQueue } from '../mq-worker';
import { initializePluginConfig } from '../service-discovery';
import { Express } from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { initTRPC } from '@trpc/server';
import { createTRPCContext } from '../trpc';
import { nanoid } from 'nanoid';
import { z } from 'zod';

export const logHandler = async (
  resolver: () => Promise<any> | any,
  logDoc: ILogDoc,
  onSuccess?: any,
  onError?: any,
  skipSaveResult?: boolean,
) => {
  if (!(await checkServiceRunning('logs'))) {
    return await resolver();
  }

  const payload = { ...(logDoc?.payload || {}) };
  const startDate = new Date();
  const startTime = performance.now();
  try {
    const result = await resolver();

    const endTime = performance.now();
    const durationMs = endTime - startTime;
    logDoc.payload = { ...payload, ...onSuccess, result };
    if (!skipSaveResult) {
      logDoc.payload.result = result;
    }
    logDoc.executionTime = {
      startDate,
      endDate: new Date(),
      durationMs: durationMs,
    };
    logDoc.status = 'success';
    sendWorkerQueue('logs', 'put_log').add('put_log', logDoc);

    return result;
  } catch (error) {
    const errorDetails = {
      message: error.message || 'Unknown error',
      stack: error.stack || 'No stack available',
      name: error.name || 'Error',
    };

    logDoc.payload = { ...payload, ...onError, error: errorDetails };
    logDoc.status = 'failed';
    sendWorkerQueue('logs', 'put_log').add('put_log', logDoc);

    throw error;
  }
};
type IContext = {
  subdomain: string;
  processId?: string;
};

type AfterMutation = {
  type: 'afterMutation';
  mutationNames: string[];
};

type UpdatedDocument = {
  type: 'updatedDocument';
  contentTypes: string[];
  when?: {
    fieldsUpdated?: string[];
    fieldsRemoved?: string[];
  };
};

type CreateDocument = {
  type: 'createdDocument';
  contentTypes: string[];
  when?: {
    fieldsWith?: string[];
  };
};

type AfterAPIRequest = {
  type: 'afterAPIRequest';
  paths: string[];
};

type AfterAuth = {
  type: 'afterAuth';
  types: string[];
};

export type IAfterProcessRule =
  | AfterMutation
  | CreateDocument
  | UpdatedDocument
  | AfterAPIRequest
  | AfterAuth;

export type TAfterProcessRule = {
  AfterMutation: AfterMutation;
  CreateDocument: CreateDocument;
  UpdatedDocument: UpdatedDocument;
  AfterAPIRequest: AfterAPIRequest;
  AfterAuth: AfterAuth;
};

export interface AfterProcessConfigs {
  rules: IAfterProcessRule[];
  onAfterMutation?: (
    context: IContext,
    args: { mutationName: string; args: { [key: string]: any }; result: any },
  ) => void;
  onAfterAuth?: (
    context: IContext,
    args: { userId: string; email: string; result: string },
  ) => void;
  onAfterApiRequest?: (context: IContext, args: any) => void;
  onDocumentUpdated?: <TDocument = any>(
    context: IContext,
    args: {
      contentType: string;
      fullDocument: TDocument;
      prevDocument: TDocument;
      updateDescription: {
        updatedFields: { [key: string]: any };
        removedFields: string[];
      };
    },
  ) => void;
  onDocumentCreated?: <TDocument = any>(
    context: IContext,
    args: {
      contentType: string;
      fullDocument: TDocument;
    },
  ) => void;
}

export const startAfterProcess = async (
  app: Express,
  pluginName: string,
  config: AfterProcessConfigs,
) => {
  await initializePluginConfig(pluginName, 'afterProcess', config);

  const t = initTRPC.context<IContext>().create();

  const {
    onAfterMutation,
    onAfterAuth,
    onAfterApiRequest,
    onDocumentUpdated,
    onDocumentCreated,
  } = config || {};

  const routes: Record<string, any> = {};

  if (onAfterMutation) {
    routes.onAfterMutation = t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => onAfterMutation(ctx, input));
  }

  if (onAfterAuth) {
    routes.onAfterAuth = t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => onAfterAuth(ctx, input));
  }

  if (onAfterApiRequest) {
    routes.onAfterApiRequest = t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => onAfterApiRequest(ctx, input));
  }

  if (onDocumentUpdated) {
    routes.onDocumentUpdated = t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => onDocumentUpdated(ctx, input));
  }

  if (onDocumentCreated) {
    routes.onDocumentCreated = t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => onDocumentCreated(ctx, input));
  }

  const afterProcessRouter = t.router(routes);

  const trpcMiddleware = trpcExpress.createExpressMiddleware({
    router: afterProcessRouter,
    createContext: createTRPCContext(async (_subdomain, context) => {
      const processId = nanoid(12);
      context.processId = processId;
      return context;
    }),
  });

  app.use('/after-process', trpcMiddleware);
};

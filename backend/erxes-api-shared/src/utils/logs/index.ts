import { checkServiceRunning } from '../utils';
import { ILogDoc } from '../../core-types';
import { createMQWorkerWithListeners, sendWorkerQueue } from '../mq-worker';
import { redis } from '../redis';
import { initializePluginConfig } from '../service-discovery';

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
  pluginName: string,
  config: AfterProcessConfigs,
) => {
  await initializePluginConfig(pluginName, 'afterProcess', config);

  return new Promise<void>((resolve, reject) => {
    try {
      createMQWorkerWithListeners(
        pluginName,
        'afterProcess',
        async ({ name, id, data: jobData }) => {
          try {
            const {
              subdomain,
              data: { processId, ...data },
            } = jobData;

            if (!subdomain) {
              throw new Error('You should provide subdomain on message');
            }

            const resolverName = name as keyof AfterProcessConfigs;

            if (
              !(name in config) ||
              typeof config[resolverName] !== 'function'
            ) {
              throw new Error(`Automations method ${name} not registered`);
            }

            const resolver = config[resolverName];

            resolver({ subdomain, processId }, data);
          } catch (error: any) {
            console.error(`Error processing job ${id}: ${error.message}`);
            throw error;
          }
        },
        redis,
        () => {
          resolve();
        },
      );
    } catch (error) {
      reject(error);
    }
  });
};

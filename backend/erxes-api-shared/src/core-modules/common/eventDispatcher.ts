import { sendWorkerQueue } from '../../utils/mq-worker';
// @ts-ignore
import { Document } from 'mongoose';
import { z } from 'zod';
import { getDiffObjects } from '../../utils/utils';
import { sendAutomationTrigger } from '../automations';
import { INotificationData, sendNotification } from '../notifications';
import { sendTRPCMessage } from '../../utils';

enum DbLogActions {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  UPDATE_MANY = 'updateMany',
  BULK_WRITE = 'bulkWrite',
  DELETE_MANY = 'deleteMany',
}

const CreateLogSchema = z.object({
  action: z.literal('create'),
  docId: z.string(),
  currentDocument: z.any(),
  prevDocument: z.any().optional(),
});

const UpdateLogSchema = z.object({
  action: z.literal('update'),
  docId: z.string(),
  currentDocument: z.any(),
  prevDocument: z.any(),
});

const DeleteLogSchema = z.object({
  action: z.literal('delete'),
  docId: z.string(),
});

const DeleteManyLogSchema = z.object({
  action: z.literal('deleteMany'),
  docIds: z.array(z.string()),
});

const UpdateManyLogSchema = z.object({
  action: z.literal('updateMany'),
  docIds: z.union([z.string(), z.array(z.string())]),
  updateDescription: z.record(z.any()),
});

const BulkWriteLogSchema = z.object({
  action: z.literal('bulkWrite'),
  docIds: z.union([z.string(), z.array(z.string())]),
  updateDescription: z.record(z.any()),
});

export const LogEventSchema = z.union([
  CreateLogSchema,
  UpdateLogSchema,
  DeleteLogSchema,
  DeleteManyLogSchema,
  UpdateManyLogSchema,
  BulkWriteLogSchema,
]);

export type LogEventInput = z.infer<typeof LogEventSchema>;

type EventPayload = {
  docIds?: string | string[];
  docId?: string;
  updateDescription?: Record<string, any>;
  processId?: string;
  userId?: string;
  source: string;
  action: string;
  status: string;
  contentType: string;
  subdomain: string;
  payload?: any;
};

export type ActivityLogInput = {
  activityType: string;
  target: any;
  context?: any;
  action: any;
  changes: any;
  metadata?: any;
};

const generateDbEventPayload = (
  input: LogEventInput,
  collectionName: string,
) => {
  if (input.action === 'create') {
    return {
      collectionName: collectionName,
      fullDocument: input.currentDocument,
    };
  }

  if (input.action === 'update') {
    return {
      collectionName: collectionName,
      updateDescription: getDiffObjects(
        input.prevDocument,
        input.currentDocument,
      ),
    };
  }
  if (input.action === 'delete') {
    return {
      collectionName: collectionName,
    };
  }
  if (input.action === 'updateMany') {
    return {
      collectionName: collectionName,
      updateDescription: input.updateDescription,
    };
  }
  if (input.action === 'bulkWrite') {
    return {
      collectionName: collectionName,
      updateDescription: input.updateDescription,
    };
  }
  if (input.action === 'deleteMany') {
    return {
      collectionName: collectionName,
    };
  }
};

const generateAutomationTriggerPayload = (
  input: LogEventInput,
  contentType: string,
):
  | { type: string; targets: any[]; recordType: 'new' | 'existing' }
  | undefined => {
  if (input.action === 'create') {
    return {
      type: contentType,
      targets: [input.currentDocument],
      recordType: 'new',
    };
  }
  if (input.action === 'update') {
    return {
      type: contentType,
      targets: [input.currentDocument],
      recordType: 'existing',
    };
  }
};

/**
 * Return type for event dispatcher with methods for logging and automation triggers
 */
export type EventDispatcherReturn = {
  /**
   * Send log event for document operations (single or bulk).
   *
   * @param input - Event input with action-specific structure:
   *   - create: `{ action: 'create', docId: string, currentDocument: any, prevDocument?: any }`
   *   - update: `{ action: 'update', docId: string, currentDocument: any, prevDocument: any }`
   *   - delete: `{ action: 'delete', docId: string }`
   *   - deleteMany: `{ action: 'deleteMany', docIds: string[] }`
   *   - updateMany: `{ action: 'updateMany', docIds: string | string[], updateDescription: Record<string, any> }`
   *   - bulkWrite: `{ action: 'bulkWrite', docIds: string | string[], updateDescription: Record<string, any> }`
   *
   * @example
   * ```ts
   * sendDbEventLog({ action: 'create', docId: '123', currentDocument: {...} })
   * sendDbEventLog({ action: 'update', docId: '123', currentDocument: {...}, prevDocument: {...} })
   * ```
   */
  sendDbEventLog: (input: LogEventInput) => void;
  /**
   * Send automation trigger for document changes.
   *
   * @param params - Configuration object
   * @param params.targets - Single document or array of documents to trigger automation for
   * @param params.recordType - Operation type: 'new' for created records, 'existing' for updated records
   */
  sendAutomationTriggerTarget: (params: {
    targets: any[];
    recordType: 'new' | 'existing';
  }) => any;
  createActivityLog: (
    input: ActivityLogInput | ActivityLogInput[],
    duserId?: string,
  ) => any;
  sendNotificationMessage: (
    notificationData: { userIds: string[] } & Partial<INotificationData>,
  ) => any;

  getContext: () => {
    subdomain: string;
    processId?: string;
    userId?: string;
  };
};

interface CreateEventDispatcherParams {
  subdomain: string;
  pluginName: string;
  moduleName: string;
  collectionName: string;
  getContext: () => {
    subdomain: string;
    processId: string;
    userId: string;
  };
}

/**
 * Create an event dispatcher instance with methods for logging and automation triggers
 * @param params - Configuration object for the event dispatcher
 * @returns Event dispatcher with methods for database event logging and automation triggers
 */
export function createEventDispatcher(
  params: CreateEventDispatcherParams,
): EventDispatcherReturn {
  const { subdomain, pluginName, moduleName, collectionName, getContext } =
    params;
  const contentType = `${pluginName}:${moduleName}.${collectionName}`;

  /**
   * Send log event for document operations (single or bulk)
   * @param input - Event input object with action-specific structure:
   *   - create: { action: 'create', docId: string | string[], currentDocument: any, prevDocument?: any }
   *   - update: { action: 'update', docId: string | string[], currentDocument: any, prevDocument: any }
   *   - delete: { action: 'delete', docId: string }
   *   - deleteMany: { action: 'deleteMany', docIds: string[] }
   *   - updateMany: { action: 'updateMany', docIds: string | string[], updateDescription: Record<string, any> }
   *   - bulkWrite: { action: 'bulkWrite', docIds: string | string[], updateDescription: Record<string, any> }
   */
  function sendDbEventLog(input: LogEventInput): void {
    const parsed = LogEventSchema.parse(input);
    const { action } = parsed;

    // Get current processId and userId dynamically each time
    const { processId, userId } = getContext();

    const queue = sendWorkerQueue('logs', 'put_log');
    const payload = generateDbEventPayload(input, collectionName);

    const eventPayload: EventPayload = {
      subdomain,
      source: 'mongo',
      action,
      status: 'success',
      contentType,
      payload,
      processId,
      userId,
    };

    if (
      action === DbLogActions.BULK_WRITE ||
      action === DbLogActions.UPDATE_MANY ||
      action === DbLogActions.DELETE_MANY
    ) {
      eventPayload.docIds = parsed.docIds;
    }
    if (
      action === DbLogActions.CREATE ||
      action === DbLogActions.UPDATE ||
      action === DbLogActions.DELETE
    ) {
      eventPayload.docId = parsed.docId;
    }

    queue.add('put_log', eventPayload, {
      removeOnComplete: true,
    });

    if (action === DbLogActions.CREATE || action === DbLogActions.UPDATE) {
      const payload = generateAutomationTriggerPayload(input, contentType);

      if (payload) {
        sendAutomationTrigger(subdomain, payload);
      }
    }
  }

  /**
   * Send automation trigger for document changes
   * @param params - Object with targets and recordType
   * @param params.targets - Single document or array of documents
   * @param params.recordType - Operation type to determine if record is 'new' or 'existing'
   */
  function sendAutomationTriggerTarget(params: {
    targets: any[];
    recordType: 'new' | 'existing';
  }) {
    return sendAutomationTrigger(subdomain, {
      type: contentType,
      targets: Array.isArray(params.targets)
        ? params.targets
        : [params.targets],
      recordType: params.recordType,
    });
  }

  function createActivityLog(
    input: ActivityLogInput | ActivityLogInput[],
    duserId?: string,
  ) {
    const { processId, userId } = getContext();

    sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'mutation',
      module: 'activityLog',
      action: 'createActivityLog',
      input: Array.isArray(input)
        ? input.map((activity) => ({
            ...activity,
            pluginName,
            moduleName,
            collectionName,
          }))
        : [{ ...input, pluginName, moduleName, collectionName }],
      context: {
        processId,
        userId: duserId || userId,
      },
    }).catch((err) => {
      console.error('createActivityLog', err);
    });
  }

  function sendNotificationMessage(
    notificationData: { userIds: string[] } & Partial<INotificationData>,
  ) {
    sendNotification(subdomain, notificationData);
  }

  return {
    sendDbEventLog,
    sendAutomationTriggerTarget,
    createActivityLog,
    sendNotificationMessage,
    getContext,
  };
}

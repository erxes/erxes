import mongoose, { Schema } from 'mongoose';
import { sendAutomationTrigger } from '../../automations';
import {
  logHandler,
  redis,
  sendTRPCMessage,
  getEnv,
  sendWorkerQueue,
  getUsageRedisKey,
  generateTargetType,
} from '../../../utils';
import { INotificationData, sendNotification } from '../../notifications';
import {
  LogEventInput,
  ActivityLogInput,
  LogEventSchema,
  DbLogActions,
  EventPayload,
} from './types';
import {
  generateAutomationTriggerPayload,
  generateDbEventPayload,
} from './utils';

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

  doCounter: (props: { delta?: number }) => Promise<void>;

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
  const contentType = generateTargetType(
    pluginName,
    moduleName,
    collectionName,
  );

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
    sendAutomationTrigger(subdomain, {
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
    const context = {
      processId,
      userId: duserId || userId,
    };

    const inputData = Array.isArray(input)
      ? input.map((activity) => ({
          ...activity,
          pluginName,
          moduleName,
          collectionName,
        }))
      : [{ ...input, pluginName, moduleName, collectionName }];

    logHandler(
      async () =>
        await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'mutation',
          module: 'activityLog',
          action: 'createActivityLog',
          input: inputData,
          context,
        }),
      {
        subdomain,
        source: 'mongo',
        action: 'activity',
        userId,
        processId,
        payload: input,
      },
    );
  }

  function sendNotificationMessage(
    notificationData: { userIds: string[] } & Partial<INotificationData>,
  ) {
    sendNotification(subdomain, notificationData);
  }

  async function doCounter({ delta = 1 }: { delta?: number }) {
    if (getEnv({ name: 'VERSION' }) !== 'saas') {
      return;
    }

    const targetType = generateTargetType(
      pluginName,
      moduleName,
      collectionName,
    );
    const redisKey = getUsageRedisKey(subdomain, targetType);

    let raw = await redis.get(redisKey);
    if (!raw) {
      raw = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'usage',
        action: 'resyncRecurringUsage',
        input: { targetType },
        defaultValue: null,
      });
    }

    const data = JSON.parse(raw || '{}');

    await redis.set(
      redisKey,
      JSON.stringify({ ...data, count: (data?.count || 0) + delta }),
      'KEEPTTL',
    );

    // Lifetime analytics (async, non-blocking)
    await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'usage',
      action: 'addCount',
      input: { targetType, delta },
      defaultValue: null,
    });
  }

  return {
    sendDbEventLog,
    sendAutomationTriggerTarget,
    createActivityLog,
    sendNotificationMessage,
    doCounter,
    getContext,
  };
}

import { sendWorkerQueue } from '../../../utils/mq-worker';
import { sendTRPCMessage } from '../../../utils/trpc';
import { LogEventInput, LogEventSchema } from './schemas';
import {
  EventDispatcherReturn,
  TLogEventPayload,
  ICreateEventHandlersParams,
  DbLogActions,
  ActivityLogInput,
} from './types';
import {
  generateAutomationTriggerPayload,
  generateDbEventPayload,
  normalizeLogEventInput,
} from './utils';
import { sendAutomationTrigger } from '../../automations';
import { INotificationData, sendNotification } from '../../notifications';

/**
 * Create an event dispatcher instance with methods for logging and automation triggers
 * @param params - Configuration object for the event dispatcher
 * @returns Event dispatcher with methods for database event logging and automation triggers
 */
export function createEventHandlers(
  params: ICreateEventHandlersParams,
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
    const normalizedInput = normalizeLogEventInput(input);
    const parsed = LogEventSchema.parse(normalizedInput);
    const { action } = parsed;

    // Get current processId and userId dynamically each time
    const { processId, userId } = getContext();

    const queue = sendWorkerQueue('logs', 'put_log');
    const payload = generateDbEventPayload(parsed, collectionName);

    const eventPayload: TLogEventPayload = {
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

    queue
      .add('put_log', eventPayload, {
        removeOnComplete: true,
      })
      .catch((err) => {
        console.error('sendDbEventLog queue.add failed', err);
      });

    if (action === DbLogActions.CREATE || action === DbLogActions.UPDATE) {
      const payload = generateAutomationTriggerPayload(parsed, contentType);

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

    const isMultiple = Array.isArray(input);
    const commonObj = { pluginName, moduleName, collectionName };

    const getInputData = (activities: ActivityLogInput[]) =>
      activities.map((activity) => ({
        ...activity,
        ...commonObj,
      }));

    const inputData = getInputData(isMultiple ? input : [input]);

    sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'mutation',
      module: 'activityLog',
      action: 'createActivityLog',
      input: inputData,
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

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
import { sendSegmentChanged } from '../../segments/events';
import { segmentJoinChanges } from '../../segments/joinChanges';
import { INotificationData, sendNotification } from '../../notifications';
import { logActivityLogError } from '../../logs/activityLog/utils';

/** One id or many, as the action recorded it, with the empties dropped. */
const toIdList = (ids?: string | string[]): string[] =>
  (Array.isArray(ids) ? ids : [ids]).filter(
    (id): id is string => typeof id === 'string' && id.length > 0,
  );

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
    const docIds = toIdList(eventPayload.docIds ?? eventPayload.docId);

    segmentJoinChanges(contentType, payload?.updateDescription)
      .then((changed) =>
        sendSegmentChanged({ subdomain, contentType, docIds, changed }),
      )
      .catch(() => sendSegmentChanged({ subdomain, contentType, docIds }));

    if (action === DbLogActions.CREATE || action === DbLogActions.UPDATE) {
      const eventUpdateDescription = payload?.updateDescription;
      const automationTriggerPayload = generateAutomationTriggerPayload(
        parsed,
        contentType,
        eventUpdateDescription,
      );

      if (automationTriggerPayload) {
        sendAutomationTrigger(subdomain, automationTriggerPayload);
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

  /**
   * Says what an entry happened inside of, for records nobody typed in.
   *
   * `createdVia` is on every schema, so this reads it once here instead of
   * asking each module to remember. A caller that set its own context keeps
   * it — this only fills a blank.
   */
  function withProvenance(
    activity: ActivityLogInput & { contextType?: string },
  ) {
    const via = activity.target?.createdVia;

    if (!via?.sourceId || activity.context || activity.contextType) {
      return activity;
    }

    return {
      ...activity,
      contextType: via.source,
      context: {
        // `text` is what the feed already renders; the ids ride in `data`,
        // which is where an activity entity keeps its own payload.
        text: via.sourceName,
        data: { sourceId: via.sourceId, runId: via.runId },
      },
    };
  }

  function createActivityLog(
    input: ActivityLogInput | ActivityLogInput[],
    duserId?: string,
  ) {
    try {
      const { processId, userId } = getContext();

      const isMultiple = Array.isArray(input);
      const commonObj = { pluginName, moduleName, collectionName };

      const getInputData = (activities: ActivityLogInput[]) =>
        activities.map((activity) => ({
          ...activity,
          ...commonObj,
        }));

      const inputData = getInputData(isMultiple ? input : [input]).map(
        withProvenance,
      );

      if (!inputData.length) {
        return;
      }

      // Nobody was in a request when an automation wrote this, so the actor
      // would otherwise come back empty. Whatever produced the record names
      // the person whose configuration it was.
      const actorId = inputData
        .map((activity) => activity.target?.createdVia?.actorId)
        .find(Boolean);

      sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'mutation',
        module: 'activityLog',
        action: 'createActivityLog',
        input: inputData,
        context: {
          processId,
          userId: duserId || userId || actorId,
        },
      }).catch((error) => {
        logActivityLogError('createActivityLog dispatch', error, {
          subdomain,
          pluginName,
          moduleName,
          collectionName,
        });
      });
    } catch (error) {
      logActivityLogError('createActivityLog setup', error, {
        subdomain,
        pluginName,
        moduleName,
        collectionName,
      });
    }
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

import { LogEventInput } from './schemas';
import { INotificationData } from '../../notifications';
export enum DbLogActions {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  UPDATE_MANY = 'updateMany',
  BULK_WRITE = 'bulkWrite',
  DELETE_MANY = 'deleteMany',
}

export type ActivityLogInput = {
  activityType: string;
  target: any;
  context?: any;
  action: any;
  changes: any;
  metadata?: any;
};

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

export interface ICreateEventHandlersParams {
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

export type ScopedEventHandlers = (
  pluginName: string,
) => (moduleName: string, collectionName: string) => EventDispatcherReturn;

export type TLogEventPayload = {
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

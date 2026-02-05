import { Model } from 'mongoose';
import { LOG_STATUSES } from '../constants';
import { ILogDocument } from 'erxes-api-shared/core-types';
import { IJobData } from '~/types';

const BATCH_SIZE = 5000;

export const LOG_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  UPDATE_MANY: 'updateMany',
  BULK_WRITE: 'bulkWrite',
} as const;

type LogAction = (typeof LOG_ACTIONS)[keyof typeof LOG_ACTIONS];

type EventPayload = {
  collectionName: string;
  docIds?: string | string[];
  docId?: string;
  action?: string;
  fullDocument?: any;
  prevDocument?: any;
  currentDocument?: any;
  updateDescription?: Record<string, any>;
  processId?: string;
  userId?: string;
  contentType?: string;
};

type BulkEventPayload = {
  action: typeof LOG_ACTIONS.UPDATE_MANY | typeof LOG_ACTIONS.BULK_WRITE;
  docIds: string[];
  collectionName: string;
  updateDescription?: Record<string, any>;
  processId?: string;
  userId?: string;
  contentType?: string;
};

const createLogDocument = async (
  Logs: Model<ILogDocument>,
  collectionName: string,
  docId: string,
  action: string,
  payload: any,
  processId?: string,
  userId?: string,
) => {
  return await Logs.create({
    action,
    docId: String(docId),
    payload,
    source: 'mongo',
    status: LOG_STATUSES.SUCCESS,
    processId,
    userId,
    createdAt: new Date(),
  });
};

const createLogDocumentsBatch = async (
  Logs: Model<ILogDocument>,
  collectionName: string,
  docIds: string[],
  action: string,
  payload: any,
  processId?: string,
  userId?: string,
) => {
  const logDocuments = docIds.map((docId) => ({
    action,
    docId: String(docId),
    payload,
    source: 'mongo',
    status: LOG_STATUSES.SUCCESS,
    processId,
    userId,
    createdAt: new Date(),
  }));

  return await Logs.insertMany(logDocuments);
};

const handleCreate = async (
  Logs: Model<ILogDocument>,
  payload: EventPayload,
) => {
  if (!payload.docId) {
    throw new Error('Document ID is required for create operation');
  }

  const logPayload = {
    collectionName: payload.collectionName,
    fullDocument: payload.fullDocument,
  };

  return await createLogDocument(
    Logs,
    payload.collectionName,
    payload.docId,
    LOG_ACTIONS.CREATE,
    logPayload,
    payload.processId,
    payload.userId,
  );
};

const handleUpdate = async (
  Logs: Model<ILogDocument>,
  payload: EventPayload,
) => {
  if (!payload.docId) {
    throw new Error('Document ID is required for update operation');
  }

  const logPayload = {
    collectionName: payload.collectionName,
    updateDescription: payload.updateDescription || {},
  };

  return await createLogDocument(
    Logs,
    payload.collectionName,
    payload.docId,
    LOG_ACTIONS.UPDATE,
    logPayload,
    payload.processId,
    payload.userId,
  );
};

const handleDelete = async (
  Logs: Model<ILogDocument>,
  payload: EventPayload,
) => {
  if (!payload.docId) {
    throw new Error('Document ID is required for delete operation');
  }

  const logPayload = {
    collectionName: payload.collectionName,
  };

  return await createLogDocument(
    Logs,
    payload.collectionName,
    payload.docId,
    LOG_ACTIONS.DELETE,
    logPayload,
    payload.processId,
    payload.userId,
  );
};

const handleUpdateMany = async (
  Logs: Model<ILogDocument>,
  payload: BulkEventPayload,
) => {
  const { collectionName, docIds, updateDescription, processId, userId } =
    payload;

  const logPayload = {
    collectionName,
    updateDescription: updateDescription || {},
  };

  if (docIds.length > BATCH_SIZE) {
    const batches: string[][] = [];
    for (let i = 0; i < docIds.length; i += BATCH_SIZE) {
      batches.push(docIds.slice(i, i + BATCH_SIZE));
    }

    const results: ILogDocument[] = [];
    for (const batch of batches) {
      const batchResult = await createLogDocumentsBatch(
        Logs,
        collectionName,
        batch,
        LOG_ACTIONS.UPDATE_MANY,
        logPayload,
        processId,
        userId,
      );
      results.push(...batchResult);
    }
    return results;
  }

  return await createLogDocumentsBatch(
    Logs,
    collectionName,
    docIds,
    LOG_ACTIONS.UPDATE_MANY,
    logPayload,
    processId,
    userId,
  );
};

const handleBulkWrite = async (
  Logs: Model<ILogDocument>,
  payload: BulkEventPayload,
) => {
  const { collectionName, docIds, updateDescription, processId, userId } =
    payload;

  const logPayload = {
    collectionName,
    updateDescription: updateDescription || {},
  };

  if (docIds.length > BATCH_SIZE) {
    const batches: string[][] = [];
    for (let i = 0; i < docIds.length; i += BATCH_SIZE) {
      batches.push(docIds.slice(i, i + BATCH_SIZE));
    }

    const results: ILogDocument[] = [];
    for (const batch of batches) {
      const batchResult = await createLogDocumentsBatch(
        Logs,
        collectionName,
        batch,
        LOG_ACTIONS.BULK_WRITE,
        logPayload,
        processId,
        userId,
      );
      results.push(...batchResult);
    }
    return results;
  }

  return await createLogDocumentsBatch(
    Logs,
    collectionName,
    docIds,
    LOG_ACTIONS.BULK_WRITE,
    logPayload,
    processId,
    userId,
  );
};

const actionMap: Record<string, Function> = {
  [LOG_ACTIONS.CREATE]: handleCreate,
  [LOG_ACTIONS.UPDATE]: handleUpdate,
  [LOG_ACTIONS.DELETE]: handleDelete,
  [LOG_ACTIONS.UPDATE_MANY]: handleUpdateMany,
  [LOG_ACTIONS.BULK_WRITE]: handleBulkWrite,
};

export const handleMongoChangeEvent = async (
  Logs: Model<ILogDocument>,
  { action, payload, docIds, docId, processId, contentType, userId }: IJobData,
) => {
  if (!action) {
    throw new Error('Action is required');
  }

  const logAction = action as LogAction;
  const isBulkOperation =
    logAction === LOG_ACTIONS.UPDATE_MANY ||
    logAction === LOG_ACTIONS.BULK_WRITE;

  // Handle bulk operations
  if (isBulkOperation && docIds && Array.isArray(docIds)) {
    const bulkPayload: BulkEventPayload = {
      action: logAction,
      docIds,
      collectionName: payload?.collectionName || '',
      updateDescription: payload?.updateDescription || {},
      processId,
      userId,
      contentType,
    };

    const handler = actionMap[logAction];
    if (!handler) {
      throw new Error(`Unsupported action: ${logAction}`);
    }
    return await handler(Logs, bulkPayload);
  }

  // Handle single document operations
  if (!docId && payload?.fullDocument?._id) {
    docId = String(payload.fullDocument._id);
  }

  if (!docId) {
    throw new Error('Document ID is required for single document operations');
  }

  const eventPayload: EventPayload = {
    collectionName: payload?.collectionName || '',
    docId,
    fullDocument: payload?.fullDocument,
    updateDescription: payload?.updateDescription,
    processId,
    userId,
    contentType,
  };

  const handler = actionMap[logAction];
  if (!handler) {
    throw new Error(`Unsupported action: ${logAction}`);
  }

  return await handler(Logs, eventPayload);
};

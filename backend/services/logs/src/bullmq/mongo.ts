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
  DELETE_MANY: 'deleteMany',
} as const;

type LogAction = (typeof LOG_ACTIONS)[keyof typeof LOG_ACTIONS];

type EventPayload = {
  collectionName: string;
  docIds?: string | string[];
  docId?: string;
  action?: string;
  fullDocument?: unknown;
  prevDocument?: unknown;
  currentDocument?: unknown;
  updateDescription?: Record<string, unknown>;
  processId?: string;
  userId?: string;
  contentType?: string;
};

type BulkEventPayload = {
  action: typeof LOG_ACTIONS.UPDATE_MANY | typeof LOG_ACTIONS.BULK_WRITE;
  docIds: string[];
  collectionName: string;
  updateDescription?: Record<string, unknown>;
  processId?: string;
  userId?: string;
  contentType?: string;
};

type DeleteManyEventPayload = {
  collectionName: string;
  docIds: string[];
  // Aligned by index with docIds; each is the doc as it was before deletion.
  prevDocuments?: unknown[];
  processId?: string;
  userId?: string;
  contentType?: string;
};

const getCollectionType = (contentType?: string, collectionName?: string) => {
  if (contentType) {
    const [, , collectionType = ''] = contentType.replace(':', '.').split('.');

    if (collectionType) {
      return collectionType;
    }
  }

  return collectionName || '';
};

const withCollectionType = (
  payload: Record<string, unknown>,
  contentType?: string,
  collectionName?: string,
) => ({
  ...payload,
  collectionType: getCollectionType(contentType, collectionName),
});

const createLogDocument = async (
  Logs: Model<ILogDocument>,
  docId: string,
  action: string,
  payload: Record<string, unknown>,
  processId?: string,
  userId?: string,
  contentType?: string,
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
    contentType,
  });
};

const createLogDocumentsBatch = async (
  Logs: Model<ILogDocument>,
  docIds: string[],
  action: string,
  payload: Record<string, unknown>,
  processId?: string,
  userId?: string,
  contentType?: string,
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
    contentType,
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
    payload.docId,
    LOG_ACTIONS.CREATE,
    withCollectionType(logPayload, payload.contentType, payload.collectionName),
    payload.processId,
    payload.userId,
    payload.contentType,
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
    payload.docId,
    LOG_ACTIONS.UPDATE,
    withCollectionType(logPayload, payload.contentType, payload.collectionName),
    payload.processId,
    payload.userId,
    payload.contentType,
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
    // The pre-deletion snapshot (when the caller supplied it) — what a revert
    // re-inserts. Absent for callers not yet passing prevDocument.
    prevDocument: payload.prevDocument,
  };

  return await createLogDocument(
    Logs,
    payload.docId,
    LOG_ACTIONS.DELETE,
    withCollectionType(logPayload, payload.contentType, payload.collectionName),
    payload.processId,
    payload.userId,
    payload.contentType,
  );
};

const handleDeleteMany = async (
  Logs: Model<ILogDocument>,
  payload: DeleteManyEventPayload,
) => {
  const { collectionName, docIds, prevDocuments, processId, userId } = payload;

  // One log per deleted doc, each carrying its own snapshot (paired by index
  // with docIds) so a revert can re-insert every removed document.
  const entries = docIds.map((docId, index) => ({
    action: LOG_ACTIONS.DELETE_MANY,
    docId: String(docId),
    payload: withCollectionType(
      { collectionName, prevDocument: prevDocuments?.[index] },
      payload.contentType,
      collectionName,
    ),
    source: 'mongo',
    status: LOG_STATUSES.SUCCESS,
    processId,
    userId,
    createdAt: new Date(),
    contentType: payload.contentType,
  }));

  if (entries.length > BATCH_SIZE) {
    const results: ILogDocument[] = [];
    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      const inserted = await Logs.insertMany(entries.slice(i, i + BATCH_SIZE));
      results.push(...inserted);
    }
    return results;
  }

  return await Logs.insertMany(entries);
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
        batch,
        LOG_ACTIONS.UPDATE_MANY,
        withCollectionType(logPayload, payload.contentType, collectionName),
        processId,
        userId,
        payload.contentType,
      );
      results.push(...batchResult);
    }
    return results;
  }

  return await createLogDocumentsBatch(
    Logs,
    docIds,
    LOG_ACTIONS.UPDATE_MANY,
    withCollectionType(logPayload, payload.contentType, collectionName),
    processId,
    userId,
    payload.contentType,
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
        batch,
        LOG_ACTIONS.BULK_WRITE,
        withCollectionType(logPayload, payload.contentType, collectionName),
        processId,
        userId,
        payload.contentType,
      );
      results.push(...batchResult);
    }
    return results;
  }

  return await createLogDocumentsBatch(
    Logs,
    docIds,
    LOG_ACTIONS.BULK_WRITE,
    withCollectionType(logPayload, payload.contentType, collectionName),
    processId,
    userId,
    payload.contentType,
  );
};

const actionMap: Record<string, Function> = {
  [LOG_ACTIONS.CREATE]: handleCreate,
  [LOG_ACTIONS.UPDATE]: handleUpdate,
  [LOG_ACTIONS.DELETE]: handleDelete,
  [LOG_ACTIONS.UPDATE_MANY]: handleUpdateMany,
  [LOG_ACTIONS.BULK_WRITE]: handleBulkWrite,
  [LOG_ACTIONS.DELETE_MANY]: handleDeleteMany,
};

export const handleMongoChangeEvent = async (
  Logs: Model<ILogDocument>,
  { action, payload, docIds, docId, processId, contentType, userId }: IJobData,
) => {
  if (!action) {
    throw new Error('Action is required');
  }

  const logAction = action as LogAction;

  // deleteMany carries a per-doc snapshot list (prevDocuments) rather than a
  // shared updateDescription, so it has its own handler/shape.
  if (logAction === LOG_ACTIONS.DELETE_MANY && docIds && Array.isArray(docIds)) {
    return await handleDeleteMany(Logs, {
      collectionName: payload?.collectionName || '',
      docIds,
      prevDocuments: (payload as { prevDocuments?: unknown[] })?.prevDocuments,
      processId,
      userId,
      contentType,
    });
  }

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

import { getDiffObjects } from '../../../utils/utils';
import { LogEventInput } from './schemas';

export const normalizeLogEventInput = (input: any): any => {
  if (!input || typeof input !== 'object') {
    return input;
  }

  const toIdString = (v: any) => {
    if (v == null) return v;
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return String(v);
    if (typeof v === 'object' && typeof v.toString === 'function') {
      return String(v.toString());
    }
    return String(v);
  };

  const out: any = { ...input };

  if ('docId' in out) {
    out.docId = toIdString(out.docId);
  }

  if ('docIds' in out) {
    if (Array.isArray(out.docIds)) {
      out.docIds = out.docIds.map(toIdString);
    } else {
      out.docIds = toIdString(out.docIds);
    }
  }

  return out;
};

export const generateDbEventPayload = (
  input: LogEventInput,
  collectionName: string,
) => {
  if (input.action === 'create') {
    return {
      ...input,
      collectionName: collectionName,
      fullDocument: input.currentDocument,
    };
  }

  if (input.action === 'update') {
    return {
      ...input,
      collectionName: collectionName,
      updateDescription: getDiffObjects(
        input.prevDocument,
        input.currentDocument,
      ),
    };
  }
  if (input.action === 'delete') {
    return {
      ...input,
      collectionName: collectionName,
      docId: input.docId,
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

export const generateAutomationTriggerPayload = (
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

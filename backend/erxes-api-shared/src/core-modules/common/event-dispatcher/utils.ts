// @ts-ignore

import { getDiffObjects, redis, sendTRPCMessage } from '../../../utils';
import { LogEventInput } from './types';

export const generateDbEventPayload = (
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

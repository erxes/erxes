import { TAfterProcessProducers } from 'erxes-api-shared/core-modules';
import { sendCoreModuleProducer } from 'erxes-api-shared/utils';
import {
  AfterProcessContext,
  HandlerContext,
  UpdatedDocumentRule,
  CreateDocumentRule,
} from './types';

export function getAllKeys(
  obj: Record<string, any>,
  prefix = '',
): string[] {
  let keys: string[] = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      keys.push(fullKey);
      if (
        typeof obj[key] === 'object' &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        keys = keys.concat(getAllKeys(obj[key], fullKey));
      }
    }
  }
  return keys;
}

export function sendProducer(
  context: AfterProcessContext,
  producerName: TAfterProcessProducers,
  input: any,
): void {
  sendCoreModuleProducer({
    subdomain: context.subdomain,
    pluginName: context.pluginName,
    moduleName: 'afterProcess',
    producerName,
    input,
  });
}

export function shouldProcessUpdatedDocument(
  rule: UpdatedDocumentRule,
  context: AfterProcessContext,
  payload: any,
): boolean {
  const { contentTypes, when } = rule;

  if (!context.contentType || !contentTypes.includes(context.contentType)) {
    return false;
  }

  if (!when) {
    return true;
  }

  const { updatedFields = {}, removedFields = {} } =
    payload.updateDescription || {};

  const hasRemovedFields = getAllKeys(removedFields).some((key) =>
    (when.fieldsRemoved || []).includes(key),
  );

  const hasUpdatedFields = getAllKeys(updatedFields).some((key) =>
    (when.fieldsUpdated || []).includes(key),
  );

  return hasRemovedFields || hasUpdatedFields;
}

export function shouldProcessCreateDocument(
  rule: CreateDocumentRule,
  context: AfterProcessContext,
  payload: any,
): boolean {
  const { contentTypes, when } = rule;

  if (!context.contentType || !contentTypes.includes(context.contentType)) {
    return false;
  }

  if (!when) {
    return true;
  }

  const document = payload?.fullDocument;
  if (!document) {
    return false;
  }

  const hasFieldsExists = getAllKeys(document).some((key) =>
    (when.fieldsWith || []).includes(key),
  );

  return hasFieldsExists;
}


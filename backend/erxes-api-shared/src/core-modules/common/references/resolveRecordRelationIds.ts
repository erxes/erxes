import { sendTRPCMessage } from '../../../utils/trpc';
import {
  getLocalRecordReferenceType,
  normalizeRecordReferenceType,
} from './utils';

export const resolveRecordRelationIds = async ({
  defaultValue,
  pluginName,
  relatedContentType,
  relType,
  sourceId,
  sourceType,
  subdomain,
}: {
  defaultValue?: any;
  pluginName: string;
  relatedContentType: string;
  relType?: string;
  sourceId: string;
  sourceType: string;
  subdomain: string;
}) => {
  if (!sourceId || !relType) {
    return defaultValue ?? [];
  }

  const relationIds = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'relation',
    action: 'getRelationIds',
    input: {
      contentType: normalizeRecordReferenceType(pluginName, sourceType),
      contentId: sourceId,
      relatedContentType,
    },
    defaultValue: [],
  }).catch(() => []);

  if (relationIds.length) {
    return relationIds;
  }

  return sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'conformity',
    action: 'savedConformity',
    input: {
      mainType: getLocalRecordReferenceType(pluginName, sourceType),
      mainTypeId: sourceId,
      relTypes: [relType],
    },
    defaultValue: defaultValue ?? [],
  });
};

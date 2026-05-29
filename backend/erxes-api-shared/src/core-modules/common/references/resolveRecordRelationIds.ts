import { sendTRPCMessage } from '../../../utils/trpc';
import { getLocalRecordReferenceType } from './utils';

export const resolveRecordRelationIds = async ({
  defaultValue,
  pluginName,
  relType,
  sourceId,
  sourceType,
  subdomain,
}: {
  defaultValue?: any;
  pluginName: string;
  relType?: string;
  sourceId: string;
  sourceType: string;
  subdomain: string;
}) => {
  if (!sourceId || !relType) {
    return defaultValue ?? [];
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

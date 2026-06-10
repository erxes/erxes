import { sendCoreModuleProducer } from '../../../utils/trpc/sendCoreModuleProducer';
import {
  TRecordReferenceProducers,
  TRecordReferenceResolveInput,
} from './types';
import { getRecordReferencePluginName } from './utils';

export type TResolveRecordReferenceValueProps = TRecordReferenceResolveInput & {
  subdomain: string;
};

export const resolveRecordReferenceValue = async ({
  defaultValue,
  path,
  subdomain,
  target,
  targetId,
  targetIds,
  type,
}: TResolveRecordReferenceValueProps) => {
  const pluginName = getRecordReferencePluginName(type);
  if (!pluginName || !path) {
    return defaultValue;
  }

  return sendCoreModuleProducer({
    subdomain,
    moduleName: 'references',
    pluginName,
    producerName: TRecordReferenceProducers.RESOLVE,
    input: {
      defaultValue,
      path,
      target,
      targetId,
      targetIds,
      type,
    },
    defaultValue,
  }).catch(() => defaultValue);
};

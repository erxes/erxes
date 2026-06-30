import { TRecordReferencesConfig } from './types';
import { asArray, getLocalRecordReferenceType } from './utils';

export const fetchRecordReferenceTargets = async ({
  config,
  models,
  pluginName,
  subdomain,
  type,
  targetId,
  targetIds,
}: {
  config: TRecordReferencesConfig;
  models: any;
  pluginName: string;
  subdomain: string;
  type: string;
  targetId?: string;
  targetIds?: string[];
}) => {
  const localType = getLocalRecordReferenceType(pluginName, type);
  const fetcher = config.fetchers?.[localType];

  if (!fetcher) {
    return [];
  }

  const ids = targetIds?.length ? targetIds : targetId ? [targetId] : [];

  if (!ids.length) {
    return [];
  }

  const result = await fetcher({
    models,
    subdomain,
    type: localType,
    id: ids[0],
    ids,
  });

  return asArray(result);
};

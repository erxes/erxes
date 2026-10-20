import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';

import { compactList } from '@/shared/utils/cursorList';
import { jsonRecord } from '@/shared/utils/json';
import {
  CREATE_MN_CONFIG,
  GET_MN_CONFIGS,
  REMOVE_MN_CONFIG,
  UPDATE_MN_CONFIG,
} from '@/shared/graphql/mnConfigs';
import { createEmptyMSDynamicConfig } from '../types';
import {
  IConfigsMap,
  IMnConfig,
  IMSDynamicConfig,
  IMSDynamicConfigMap,
} from '../types/types';

/** MS Dynamic configs hook for crud and save */
export const useMSDynamicConfigs = () => {
  const [saveLoading, setSaveLoading] = useState(false);

  const { data, loading, refetch } = useQuery(GET_MN_CONFIGS, {
    variables: { code: 'DYNAMIC' },
    fetchPolicy: 'network-only',
  });

  const [createConfig] = useMutation(CREATE_MN_CONFIG);
  const [updateConfig] = useMutation(UPDATE_MN_CONFIG);
  const [removeConfig] = useMutation(REMOVE_MN_CONFIG);

  const configDocs = compactList(data?.mnConfigs);

  const configsMap: IConfigsMap = {
    DYNAMIC: configDocs.reduce((acc, doc) => {
      if (doc.subId) {
        acc[doc.subId] = {
          ...createEmptyMSDynamicConfig(),
          ...jsonRecord<Partial<IMSDynamicConfig>>(doc.value),
        };
      }
      return acc;
    }, {} as IMSDynamicConfigMap),
  };

  const saveConfigs = async (nextConfigsMap: IConfigsMap) => {
    setSaveLoading(true);
    try {
      const nextEntries = nextConfigsMap.DYNAMIC || {};

      const currentById = configDocs.reduce((acc, doc) => {
        if (doc.subId) {
          acc[doc.subId] = doc;
        }
        return acc;
      }, {} as Record<string, IMnConfig>);

      const removes: Array<Promise<unknown>> = [];
      const creates: Array<Promise<unknown>> = [];
      const updates: Array<Promise<unknown>> = [];

      for (const [subId, doc] of Object.entries(currentById)) {
        if (!nextEntries[subId]) {
          removes.push(removeConfig({ variables: { id: doc._id } }));
        }
      }

      for (const [subId, value] of Object.entries(nextEntries)) {
        const current = currentById[subId];
        if (!current) {
          creates.push(
            createConfig({
              variables: { code: 'DYNAMIC', subId, value },
            }),
          );
        } else if (JSON.stringify(current.value) !== JSON.stringify(value)) {
          updates.push(
            updateConfig({
              variables: { id: current._id, subId, value },
            }),
          );
        }
      }

      const results = await Promise.allSettled([
        ...removes,
        ...creates,
        ...updates,
      ]);
      await refetch();

      const failed = results.filter((r) => r.status === 'rejected');
      if (failed.length) {
        throw new Error(`Failed to save ${failed.length} config mutation(s)`);
      }
    } finally {
      setSaveLoading(false);
    }
  };

  return {
    configsMap,
    loading,
    saveConfigs,
    saveLoading,
  };
};

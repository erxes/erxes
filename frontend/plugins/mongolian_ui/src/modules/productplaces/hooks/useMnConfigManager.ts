import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, ApolloCache } from '@apollo/client';
import { MN_CONFIGS } from '../graphql/clientQueries';
import {
  MN_CONFIGS_CREATE,
  MN_CONFIGS_UPDATE,
  MN_CONFIGS_REMOVE,
} from '../graphql/clientMutations';
import {
  objectToKeyValueArray,
  keyValueArrayToObject,
} from '../utils/transformers';

interface MnConfigValueItem {
  key: string;
  value: any;
}

interface MnConfig {
  _id: string;
  subId?: string;
  value: MnConfigValueItem[];
}

interface MnConfigsQueryResponse {
  mnConfigs: MnConfig[];
}

// ---------- Hook ----------
export function useMnConfigManager<
  T extends { _id?: string; subId?: string; stageI?: string } // <-- added stageId constraint
>(
  code: string,
  emptyForm: T,
  transformValue: (value: any) => Partial<T> = (v) => v as Partial<T>
) {
  const [savedConfigs, setSavedConfigs] = useState<T[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<T>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data,
    loading: queryLoading,
    refetch,
  } = useQuery<MnConfigsQueryResponse>(MN_CONFIGS, {
    variables: { code },
    fetchPolicy: 'network-only',
  });

  // Cache helper with proper typing
  const updateCache = useCallback(
    (cache: ApolloCache<any>, updater: (configs: MnConfig[]) => MnConfig[]) => {
      const existing = cache.readQuery<MnConfigsQueryResponse>({
        query: MN_CONFIGS,
        variables: { code },
      });
      if (!existing?.mnConfigs) return;
      cache.writeQuery<MnConfigsQueryResponse>({
        query: MN_CONFIGS,
        variables: { code },
        data: { mnConfigs: updater(existing.mnConfigs) },
      });
    },
    [code]
  );

  const [createConfig] = useMutation(MN_CONFIGS_CREATE, {
    update(cache, { data }) {
      if (!data) return;
      updateCache(cache, (configs) => [...configs, data.mnConfigsCreate]);
    },
  });

  const [updateConfig] = useMutation(MN_CONFIGS_UPDATE, {
    update(cache, { data }) {
      if (!data) return;
      updateCache(cache, (configs) =>
        configs.map((c) =>
          c._id === data.mnConfigsUpdate._id ? data.mnConfigsUpdate : c
        )
      );
    },
  });

  const [deleteConfig] = useMutation(MN_CONFIGS_REMOVE, {
    update(cache, { data }) {
      if (!data) return;
      updateCache(cache, (configs) =>
        configs.filter((c) => c._id !== data.mnConfigsRemove._id)
      );
    },
  });

  // Load data
  useEffect(() => {
    if (data?.mnConfigs) {
      const transformed = data.mnConfigs.map((cfg) => ({
        _id: cfg._id,
        subId: cfg.subId,
        ...transformValue(keyValueArrayToObject(cfg.value)),
      })) as T[];
      setSavedConfigs(transformed);
    }
  }, [data, transformValue]);

  // Sync form with active config
  useEffect(() => {
    setFormData(
      activeIndex !== null ? savedConfigs[activeIndex] ?? emptyForm : emptyForm
    );
  }, [activeIndex, savedConfigs, emptyForm]);

  const updateField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setActiveIndex(null);
    setFormData(emptyForm);
  }, [emptyForm]);

  const save = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { _id, subId, ...rest } = formData;
      const valueArray = objectToKeyValueArray(rest);
      if (_id) {
        await updateConfig({ variables: { _id, value: valueArray } });
      } else {
        // rest.stageId is now safe because T includes stageId
        await createConfig({
          variables: {
            code,
            subId:  (rest as any).stageId,
            value: valueArray,
          },
        });
      }
      await refetch();
      resetForm();
    } catch (err) {
      console.error('Save failed', err);
      setError('Save failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [formData, updateConfig, createConfig, refetch, resetForm, code]);

  const del = useCallback(async () => {
    if (activeIndex === null) return;
    if (!window.confirm('Delete this config?')) return;
    const config = savedConfigs[activeIndex];
    if (!config._id) return;
    setLoading(true);
    setError(null);
    try {
      await deleteConfig({ variables: { _id: config._id } });
      await refetch();
      resetForm();
    } catch (err) {
      console.error('Delete failed', err);
      setError('Delete failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [activeIndex, savedConfigs, deleteConfig, refetch, resetForm]);

  return {
    savedConfigs,
    activeIndex,
    setActiveIndex,
    formData,
    updateField,
    loading,
    error,
    queryLoading,
    save,
    del,
    resetForm,
  };
}
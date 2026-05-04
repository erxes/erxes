import { useMutation, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import {
  MN_CONFIGS_CREATE,
  MN_CONFIGS_REMOVE,
  MN_CONFIGS_UPDATE,
} from '../graphql/clientMutations';
import { MN_CONFIGS } from '../graphql/clientQueries';
import {
  keyValueArrayToObject,
  objectToKeyValueArray,
} from '../utils/transformers';

interface MnConfig {
  _id: string;
  subId?: string;
  value: { key: string; value: any }[];
}

interface Options<T> {
  code: string;
  emptyForm: T;
  getSubId: (form: T) => string;
}

export function useMnConfig<T extends { _id?: string }>({
  code,
  emptyForm,
  getSubId,
}: Options<T>) {
  const [savedConfigs, setSavedConfigs] = useState<T[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<T>(emptyForm);
  const [loading, setLoading] = useState(false);

  const { data } = useQuery<{ mnConfigs: MnConfig[] }>(MN_CONFIGS, {
    variables: { code },
    fetchPolicy: 'network-only',
  });

  const [createConfig] = useMutation(MN_CONFIGS_CREATE);
  const [updateConfig] = useMutation(MN_CONFIGS_UPDATE);
  const [deleteConfig] = useMutation(MN_CONFIGS_REMOVE);

  useEffect(() => {
    if (data?.mnConfigs) {
      const transformed = data.mnConfigs.map((cfg) => ({
        _id: cfg._id,
        subId: cfg.subId,
        ...keyValueArrayToObject(cfg.value),
      })) as T[];
      setSavedConfigs(transformed);
    }
  }, [data]);

  useEffect(() => {
    setFormData(
      activeIndex === null ? emptyForm : (savedConfigs[activeIndex] ?? emptyForm),
    );
  }, [activeIndex, savedConfigs]);

  const reset = () => {
    setActiveIndex(null);
    setFormData(emptyForm);
  };

  const handleSave = async (onSuccess?: () => void, onError?: (e: any) => void) => {
    setLoading(true);
    try {
      const { _id, ...rest } = formData as any;
      const valueArray = objectToKeyValueArray(rest);

      if (_id) {
        await updateConfig({ variables: { _id, value: valueArray } });
      } else {
        await createConfig({
          variables: { code, subId: getSubId(formData), value: valueArray },
        });
      }

      reset();
      onSuccess?.();
    } catch (e) {
      onError?.(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (onSuccess?: () => void, onError?: (e: any) => void) => {
    if (activeIndex === null) return;
    const config = savedConfigs[activeIndex];
    if (!config._id) return;

    setLoading(true);
    try {
      await deleteConfig({ variables: { _id: config._id } });
      reset();
      onSuccess?.();
    } catch (e) {
      onError?.(e);
    } finally {
      setLoading(false);
    }
  };

  return {
    savedConfigs,
    activeIndex,
    setActiveIndex,
    formData,
    setFormData,
    loading,
    reset,
    handleSave,
    handleDelete,
  };
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from 'erxes-ui';
import { useProductsConfigs } from '@/products/settings/hooks/useProductsConfigs';
import { useProductsConfigsUpdate } from '@/products/settings/hooks/useProductsConfigsUpdate';
import { ISimilarityGroupConfig, ISimilarityGroupMap } from './types';
import { nanoid } from 'nanoid';

export const useSimilarityGroups = () => {
  const { toast } = useToast();
  const { configs, loading: configsLoading } = useProductsConfigs();
  const { productsConfigsUpdate, loading: updating } =
    useProductsConfigsUpdate();

  const initialGroupsMap = useMemo(() => {
    const config = configs.find((c) => c.code === 'similarityGroup');
    return (config?.value as unknown as ISimilarityGroupMap) || {};
  }, [configs]);

  const [groupsMap, setGroupsMap] = useState<ISimilarityGroupMap>({});
  const [newlyAddedKey, setNewlyAddedKey] = useState<string | null>(null);

  useEffect(() => {
    if (configs.length > 0) {
      setGroupsMap(initialGroupsMap);
    }
  }, [initialGroupsMap, configs.length]);

  const handleAddNew = () => {
    const tempGroupKey = nanoid();
    setNewlyAddedKey(tempGroupKey);
    setGroupsMap((prev) => ({
      ...prev,
      [tempGroupKey]: {
        title: 'New similarity group',
        filterField: '',
        codeMask: '',
        defaultProduct: '',
        rules: [],
      },
    }));
  };

  const handleSave = useCallback(
    async (
      oldGroupKey: string,
      newGroupKey: string,
      config: ISimilarityGroupConfig,
    ) => {
      const updated = { ...groupsMap };

      if (oldGroupKey !== newGroupKey) {
        delete updated[oldGroupKey];
      }

      const key = newGroupKey || oldGroupKey;
      updated[key] = config;

      try {
        await productsConfigsUpdate({
          variables: {
            configsMap: {
              similarityGroup: updated,
            },
          },
        });
        setGroupsMap(updated);
        toast({ title: 'Similarity group saved successfully' });
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to save similarity group',
          variant: 'destructive',
        });
      }
    },
    [groupsMap, productsConfigsUpdate, toast],
  );

  const handleDelete = useCallback(
    async (codeGroupKey: string) => {
      const updated = { ...groupsMap };
      delete updated[codeGroupKey];

      try {
        await productsConfigsUpdate({
          variables: {
            configsMap: {
              similarityGroup: updated,
            },
          },
        });
        setGroupsMap(updated);
        toast({ title: 'Similarity group deleted successfully' });
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to delete similarity group',
          variant: 'destructive',
        });
      }
    },
    [groupsMap, productsConfigsUpdate, toast],
  );

  return {
    groupsMap,
    configsLoading,
    updating,
    newlyAddedKey,
    handleAddNew,
    handleSave,
    handleDelete,
  };
};

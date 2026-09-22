import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from 'erxes-ui';
import { useProductsConfigs } from '@/products/settings/hooks/useProductsConfigs';
import { useProductsConfigsUpdate } from '@/products/settings/hooks/useProductsConfigsUpdate';
import { ISimilarityGroupConfig, ISimilarityGroupMap } from './types';
import { nanoid } from 'nanoid';

export const useSimilarityGroups = () => {
  const { t } = useTranslation('product', { keyPrefix: 'similarity-config' });
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
        title: t('new-similarity-group', 'New similarity group'),
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
        toast({
          title: t('group-saved', 'Similarity group saved successfully'),
        });
      } catch {
        toast({
          title: t('error', 'Error'),
          description: t('save-group-failed', 'Failed to save similarity group'),
          variant: 'destructive',
        });
      }
    },
    [groupsMap, productsConfigsUpdate, toast, t],
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
        toast({
          title: t('group-deleted', 'Similarity group deleted successfully'),
        });
      } catch {
        toast({
          title: t('error', 'Error'),
          description: t(
            'delete-group-failed',
            'Failed to delete similarity group',
          ),
          variant: 'destructive',
        });
      }
    },
    [groupsMap, productsConfigsUpdate, toast, t],
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

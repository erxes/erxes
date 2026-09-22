import { useMemo, useState } from 'react';
import { toast, useConfirm } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import {
  getMSDynamicConfigs,
  getMSDynamicErrorMessage,
  MSMDynamicConfigRow,
  TMSDynamicConfig,
  normalizeMSDynamicConfig,
} from '../types';
import { IConfigsMap } from '../types/types';

type SaveMSDynamicConfigs = (configsMap: IConfigsMap) => Promise<void>;

export const useMSDynamicConfigActions = ({
  configsMap,
  saveConfigs,
}: {
  configsMap: IConfigsMap;
  saveConfigs: SaveMSDynamicConfigs;
}) => {
  const { t } = useTranslation('mongolian');
  const [loading, setLoading] = useState(false);
  const { confirm } = useConfirm();

  const rows = useMemo(
    () =>
      Object.entries(getMSDynamicConfigs(configsMap)).map(
        ([configKey, config]) => normalizeMSDynamicConfig(configKey, config),
      ),
    [configsMap],
  );

  const saveConfig = async (
    data: TMSDynamicConfig,
    mode: 'create' | 'update',
    currentKey?: string,
  ) => {
    const nextKey = data.brandId.trim();
    const dynamicConfigs = getMSDynamicConfigs(configsMap);
    const duplicateKey = Object.keys(dynamicConfigs).find(
      (key) => key === nextKey && key !== currentKey,
    );

    if (duplicateKey) {
      toast({
        title: t('error'),
        description: t('brand-id-already-has-config'),
        variant: 'destructive',
      });
      return false;
    }

    const nextDynamic = { ...dynamicConfigs };

    if (currentKey) {
      delete nextDynamic[currentKey];
    }

    nextDynamic[nextKey] = { ...data, brandId: nextKey };

    try {
      setLoading(true);
      await saveConfigs({ ...configsMap, DYNAMIC: nextDynamic });
      toast({
        title: t('success'),
        description:
          mode === 'update'
            ? t('config-updated-successfully')
            : t('config-created-successfully'),
      });
      return true;
    } catch (error) {
      toast({
        title: 'Error',
        description: getMSDynamicErrorMessage(error, 'Failed to save config'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }

    return false;
  };

  const removeConfig = (row: MSMDynamicConfigRow) => {
    confirm({
      message: t('delete-config'),
      options: {
        description: t('delete-config-description'),
        okLabel: t('delete'),
        cancelLabel: t('cancel'),
      },
    }).then(async () => {
      const nextDynamic = { ...getMSDynamicConfigs(configsMap) };
      delete nextDynamic[row.configKey];

      try {
        setLoading(true);
        await saveConfigs({ ...configsMap, DYNAMIC: nextDynamic });
        toast({
          title: t('success'),
          description: t('config-deleted-successfully'),
        });
      } catch (error) {
        toast({
          title: t('error'),
          description: getMSDynamicErrorMessage(
            error,
            t('failed-to-delete-config'),
          ),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    });
  };

  const removeConfigs = async (selectedRows: MSMDynamicConfigRow[]) => {
    const nextDynamic = { ...getMSDynamicConfigs(configsMap) };

    selectedRows.forEach((row) => {
      delete nextDynamic[row.configKey];
    });

    try {
      setLoading(true);
      await saveConfigs({ ...configsMap, DYNAMIC: nextDynamic });
      toast({
        title: t('success'),
        description: t('selected-configs-deleted-successfully'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: getMSDynamicErrorMessage(
          error,
          t('failed-to-delete-selected-configs'),
        ),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    removeConfig,
    removeConfigs,
    rows,
    saveConfig,
  };
};

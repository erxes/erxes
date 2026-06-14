import { useMemo, useState } from 'react';
import { toast, useConfirm } from 'erxes-ui';

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
        title: 'Error',
        description: 'Brand ID already has a config',
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
        title: 'Success',
        description:
          mode === 'update'
            ? 'Config updated successfully'
            : 'Config created successfully',
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
      message: 'Delete MS Dynamics config?',
      options: {
        description: 'This will delete this config.',
        okLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    }).then(async () => {
      const nextDynamic = { ...getMSDynamicConfigs(configsMap) };
      delete nextDynamic[row.configKey];

      try {
        setLoading(true);
        await saveConfigs({ ...configsMap, DYNAMIC: nextDynamic });
        toast({
          title: 'Success',
          description: 'Config deleted successfully',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: getMSDynamicErrorMessage(
            error,
            'Failed to delete config',
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
        title: 'Success',
        description: 'Selected configs deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: getMSDynamicErrorMessage(
          error,
          'Failed to delete selected configs',
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

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_MN_CONFIGS } from '@/ebarimt/settings/stage-in-return-ebarimt-config/graphql/queries/mnConfigs';
import { ReturnEbarimtConfig } from '@/ebarimt/settings/stage-in-return-ebarimt-config/types';

type ReturnEbarimtConfigWithId = ReturnEbarimtConfig & {
  _id?: string;
};

export const useEbarimtReturnConfigState = () => {
  const { data, refetch, loading } = useQuery(GET_MN_CONFIGS, {
    variables: { code: 'returnStageInEbarimt' },
    fetchPolicy: 'network-only',
  });

  const configsList = useMemo(() => data?.mnConfigs || [], [data?.mnConfigs]);

  const parseConfigValue = (value: any) => {
    if (!value) return {};
    return typeof value === 'string' ? JSON.parse(value) : value;
  };

  const [localConfigsMap, setLocalConfigsMap] = useState<
    Record<string, ReturnEbarimtConfigWithId>
  >({});

  useEffect(() => {
    const map: Record<string, ReturnEbarimtConfigWithId> = {};

    configsList.forEach((config: any) => {
      if (config.subId) {
        map[config.subId] = {
          ...parseConfigValue(config.value),
          _id: config._id,
        };
      }
    });

    setLocalConfigsMap(map);
  }, [configsList]);

  const addNewConfig = () => {
    const configKey = `config_${Date.now()}`;

    const newConfig: ReturnEbarimtConfigWithId = {
      title: 'New Return Ebarimt Config',
      destinationStageBoard: '',
      pipelineId: '',
      stageId: '',
      userEmail: '',
      hasVat: false,
      hasCitytax: false,
    };

    const updatedConfigsMap = {
      ...localConfigsMap,
      [configKey]: newConfig,
    };

    setLocalConfigsMap(updatedConfigsMap);
    return updatedConfigsMap;
  };

  const deleteConfig = (configKey: string) => {
    const updatedConfigsMap = { ...localConfigsMap };
    delete updatedConfigsMap[configKey];

    setLocalConfigsMap(updatedConfigsMap);
    return updatedConfigsMap;
  };

  const saveConfig = (
    configKey: string,
    configData: ReturnEbarimtConfigWithId,
  ) => {
    const updatedConfigsMap = {
      ...localConfigsMap,
      [configKey]: configData,
    };

    setLocalConfigsMap(updatedConfigsMap);
    return updatedConfigsMap;
  };

  const getConfigById = (configId: string) => {
    return configsList.find((config: any) => config._id === configId);
  };

  const getConfigByStageId = (stageId: string) => {
    return configsList.find((config: any) => config.subId === stageId);
  };

  return {
    localConfigsMap,
    configsList,
    loading,
    refetch,
    addNewConfig,
    deleteConfig,
    saveConfig,
    getConfigById,
    getConfigByStageId,
  };
};

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_CONFIGS_GET_VALUE } from '@/ebarimt/settings/stage-in-return-ebarimt-config/graphql/queries/useStageInEBarimtConfigQuery';
import { ReturnEbarimtConfig } from '@/ebarimt/settings/stage-in-return-ebarimt-config/types';

export const useEbarimtReturnConfigState = () => {
  const { data, refetch, loading } = useQuery(GET_CONFIGS_GET_VALUE, {
    variables: { code: 'returnStageInEbarimt' },
    fetchPolicy: 'network-only',
  });

  const configValue = data?.configsGetValue?.value;

  const parseConfigValue = (value: any) => {
    if (!value) return {};
    return typeof value === 'string' ? JSON.parse(value) : value;
  };

  const [localConfigsMap, setLocalConfigsMap] = useState(() =>
    parseConfigValue(configValue),
  );

  useEffect(() => {
    setLocalConfigsMap(parseConfigValue(configValue));
  }, [configValue]);

  const addNewConfig = () => {
    const configKey = `config_${Date.now()}`;
    const newConfig: ReturnEbarimtConfig = {
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

  const saveConfig = (configKey: string, configData: ReturnEbarimtConfig) => {
    const updatedConfigsMap = {
      ...localConfigsMap,
      [configKey]: configData,
    };

    setLocalConfigsMap(updatedConfigsMap);
    return updatedConfigsMap;
  };

  return {
    localConfigsMap,
    loading,
    refetch,
    addNewConfig,
    deleteConfig,
    saveConfig,
  };
};

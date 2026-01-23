import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_MN_CONFIGS } from '@/ebarimt/settings/stage-in-ebarimt-config/graphql/queries/mnConfigs';
import { TStageInEbarimtConfig } from '@/ebarimt/settings/stage-in-ebarimt-config/types';

export const useEbarimtConfigState = () => {
  const { data, refetch, loading } = useQuery(GET_MN_CONFIGS, {
    variables: { code: 'stageInEbarimt' },
    fetchPolicy: 'network-only',
  });

  const configsList = useMemo(() => data?.mnConfigs || [], [data?.mnConfigs]);

  const parseConfigValue = (value: any) => {
    if (!value) return {};
    return typeof value === 'string' ? JSON.parse(value) : value;
  };

  // Convert array of configs to a map for backward compatibility
  const [localConfigsMap, setLocalConfigsMap] = useState(() => {
    const map: Record<string, any> = {};
    configsList.forEach((config: any) => {
      if (config.subId) {
        map[config.subId] = parseConfigValue(config.value);
      }
    });
    return map;
  });

  useEffect(() => {
    const map: Record<string, any> = {};
    configsList.forEach((config: any) => {
      if (config.subId) {
        map[config.subId] = parseConfigValue(config.value);
      }
    });
    setLocalConfigsMap(map);
  }, [configsList]);

  const addNewConfig = () => {
    const configKey = `config_${Date.now()}`;
    const newConfig: TStageInEbarimtConfig = {
      title: 'New Stage In Ebarimt Config',
      destinationStageBoard: '',
      pipelineId: '',
      stageId: '',
      posNo: '',
      companyRD: '',
      merchantTin: '',
      branchOfProvince: '',
      subProvince: '',
      districtCode: '',
      companyName: '',
      defaultUnitedCode: '',
      headerText: '',
      branchNo: '',
      hasVat: false,
      citytaxPercent: '',
      vatPercent: '',
      anotherRulesOfProductsOnVat: '',
      vatPayableAccount: '',
      hasAllCitytax: false,
      allCitytaxPayableAccount: '',
      footerText: '',
      anotherRulesOfProductsOnCitytax: '',
      withDescription: false,
      skipEbarimt: false,
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

  const saveConfig = (configKey: string, configData: TStageInEbarimtConfig) => {
    const updatedConfigsMap = {
      ...localConfigsMap,
      [configKey]: configData,
    };

    setLocalConfigsMap(updatedConfigsMap);
    return updatedConfigsMap;
  };

  // Helper functions for the new structure
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

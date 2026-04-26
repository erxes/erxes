import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_MN_CONFIGS } from '@/ebarimt/settings/pos-in-ebarimt-config/graphql/mnConfigs';
import { TPosInEbarimtConfig } from '@/ebarimt/settings/pos-in-ebarimt-config/types';

export const useEbarimtConfigState = () => {
  const { data, refetch, loading } = useQuery(GET_MN_CONFIGS, {
    variables: { code: 'posInEbarimt' },
    fetchPolicy: 'network-only',
  });

  const configsList = useMemo(() => data?.mnConfigs || [], [data?.mnConfigs]);

  const parseConfigValue = (value: any) => {
    if (!value) return {};
    return typeof value === 'string' ? JSON.parse(value) : value;
  };

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
    const newConfig: TPosInEbarimtConfig = {
      title: 'New Pos In Ebarimt Config',
      posId: '',
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
      reverseVatRules: '',
      hasCitytax: false,
      footerText: '',
      reverseCtaxRules: '',
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

  const saveConfig = (configKey: string, configData: TPosInEbarimtConfig) => {
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

  const getConfigByPosId = (posId: string) => {
    return configsList.find((config: any) => config.subId === posId);
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
    getConfigByPosId,
  };
};

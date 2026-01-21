import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_MN_CONFIGS } from '@/ebarimt/settings/stage-in-ebarimt-config/graphql/queries/mnConfigs';
import { TStageInEbarimtConfig } from '@/ebarimt/settings/stage-in-ebarimt-config/types';

export const useEbarimtConfigState = () => {
  const { data, refetch, loading } = useQuery(GET_MN_CONFIGS, {
    variables: { code: 'stageInEbarimt' },
    fetchPolicy: 'network-only',
  });

  const configData = data?.mnConfigs?.[0];
  const configValue = configData?.value;
  const configId = configData?._id;

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

  return {
    localConfigsMap,
    loading,
    refetch,
    configId,
    addNewConfig,
    deleteConfig,
    saveConfig,
  };
};

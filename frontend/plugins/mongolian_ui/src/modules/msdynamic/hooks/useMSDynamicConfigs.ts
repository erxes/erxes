import { gql, useMutation, useQuery } from '@apollo/client';

import { mutations, queries } from '../graphql';
import { IConfigsMap, IMSDynamicConfigMap } from '../types/types';

type ConfigsGetValueQuery = {
  configsGetValue?: {
    value?: IMSDynamicConfigMap;
  } | null;
};

type ConfigsGetValueVariables = {
  code: string;
};

type ConfigsUpdateMutation = {
  configsUpdate: boolean;
};

type ConfigsUpdateVariables = {
  configsMap: IConfigsMap;
};

const MSDYNAMIC_CONFIG_CODE = 'DYNAMIC';

export const useMSDynamicConfigs = () => {
  const { data, loading, refetch } = useQuery<
    ConfigsGetValueQuery,
    ConfigsGetValueVariables
  >(gql(queries.configs), {
    variables: { code: MSDYNAMIC_CONFIG_CODE },
    fetchPolicy: 'network-only',
  });

  const [updateConfigs, { loading: updateLoading }] = useMutation<
    ConfigsUpdateMutation,
    ConfigsUpdateVariables
  >(gql(mutations.updateConfigs));

  const configsMap: IConfigsMap = {
    DYNAMIC: data?.configsGetValue?.value || {},
  };

  const saveConfigs = async (nextConfigsMap: IConfigsMap) => {
    await updateConfigs({
      variables: {
        configsMap: nextConfigsMap,
      },
    });

    await refetch();
  };

  return {
    configsMap,
    loading,
    saveConfigs,
    saveLoading: updateLoading,
  };
};

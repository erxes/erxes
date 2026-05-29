import { useMutation, useQuery } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { GET_CONFIGS_GET_VALUE } from '../graphql/queries/useStageInErkhetConfigQuery';
import {
  CREATE_STAGE_IN_ERKHET_CONFIG,
  REMOVE_STAGE_IN_ERKHET_CONFIG,
  UPDATE_STAGE_IN_ERKHET_CONFIG,
} from '../graphql/mutations/createStageInErkhetConfigMutations';
import { TErkhetConfig } from '../types';

const CONFIG_CODE = 'ebarimtConfig';

export type TStageInErkhetConfigRow = TErkhetConfig & { _id: string };

const parseConfigValue = (value: any) =>
  typeof value === 'string' ? JSON.parse(value) : value || {};

const readConfig = (value: any) => {
  const config = parseConfigValue(value);
  const paymentTypes = config.paymentTypes || {};

  return {
    ...config,
    ...paymentTypes,
    responseField: config.responseField ?? config.chooseResponseField ?? '',
    hasCitytax: config.hasCitytax ?? config.hasCityTax ?? false,
    reverseVatRules: toArrayValue(
      config.reverseVatRules ?? config.anotherRulesOfProductsOnVat,
    ),
    reverseCtaxRules: toArrayValue(
      config.reverseCtaxRules ?? config.anotherRulesOfProductsOnCitytax,
    ),
  };
};

const toArrayValue = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return value ? [value] : [];
};

const writeConfig = (data: TErkhetConfig) => {
  const {
    chooseResponseField,
    hasCityTax,
    anotherRulesOfProductsOnCitytax,
    anotherRulesOfProductsOnVat,
    ...config
  } = data;
  delete config.paymentTypes;
  delete config._id;
  delete config.subId;

  return {
    ...config,
    responseField: config.responseField ?? chooseResponseField ?? '',
    hasCitytax: config.hasCitytax ?? hasCityTax ?? false,
    reverseVatRules: toArrayValue(
      config.reverseVatRules ?? anotherRulesOfProductsOnVat,
    ),
    reverseCtaxRules: toArrayValue(
      config.reverseCtaxRules ?? anotherRulesOfProductsOnCitytax,
    ),
  };
};

export const useStageInErkhetConfigs = () => {
  const { toast } = useToast();

  const { data, loading, refetch } = useQuery(GET_CONFIGS_GET_VALUE, {
    variables: { code: CONFIG_CODE },
    fetchPolicy: 'cache-and-network',
  });

  const configs: TStageInErkhetConfigRow[] = (data?.mnConfigs || []).map(
    (config: any) => ({
      _id: config._id,
      subId: config.subId,
      ...readConfig(config.value),
    }),
  );

  const mutationOptions = {
    onError: (e: Error) => {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    },
  };

  const [createConfig, { loading: createLoading }] = useMutation(
    CREATE_STAGE_IN_ERKHET_CONFIG,
    mutationOptions,
  );
  const [updateConfig, { loading: updateLoading }] = useMutation(
    UPDATE_STAGE_IN_ERKHET_CONFIG,
    mutationOptions,
  );
  const [removeConfig, { loading: removeLoading }] = useMutation(
    REMOVE_STAGE_IN_ERKHET_CONFIG,
    mutationOptions,
  );

  const addConfig = async (data: TErkhetConfig) => {
    const value = writeConfig(data);
    await createConfig({
      variables: { code: CONFIG_CODE, subId: value.stageId, value },
    });
    await refetch();
    toast({ title: 'Success', description: 'Config created successfully' });
  };

  const editConfig = async (id: string, data: TErkhetConfig) => {
    const value = writeConfig(data);
    await updateConfig({
      variables: { id, subId: value.stageId, value },
    });
    await refetch();
    toast({ title: 'Success', description: 'Config updated successfully' });
  };

  const deleteConfig = async (id: string) => {
    await removeConfig({ variables: { id } });
    await refetch();
    toast({ title: 'Success', description: 'Config deleted successfully' });
  };

  const deleteManyConfigs = async (ids: string[]) => {
    await Promise.all(ids.map((id) => removeConfig({ variables: { id } })));
    await refetch();
    toast({ title: 'Success', description: `${ids.length} config(s) deleted` });
  };

  return {
    configs,
    loading,
    saveLoading: createLoading || updateLoading || removeLoading,
    addConfig,
    editConfig,
    deleteConfig,
    deleteManyConfigs,
  };
};

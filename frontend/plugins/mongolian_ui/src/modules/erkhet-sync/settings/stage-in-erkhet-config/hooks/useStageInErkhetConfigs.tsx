import { useMutation, useQuery } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TErkhetConfig } from '../types';
import {
  CREATE_MN_CONFIG,
  GET_MN_CONFIGS,
  REMOVE_MN_CONFIG,
  UPDATE_MN_CONFIG,
} from '@/shared/graphql/mnConfigs';

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
  const { t } = useTranslation('mongolian');
  const { toast } = useToast();

  const { data, loading, refetch } = useQuery(GET_MN_CONFIGS, {
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
      toast({ title: t('error'), description: e.message, variant: 'destructive' });
    },
  };

  const [createConfig, { loading: createLoading }] = useMutation(
    CREATE_MN_CONFIG,
    mutationOptions,
  );
  const [updateConfig, { loading: updateLoading }] = useMutation(
    UPDATE_MN_CONFIG,
    mutationOptions,
  );
  const [removeConfig, { loading: removeLoading }] = useMutation(
    REMOVE_MN_CONFIG,
    mutationOptions,
  );

  const addConfig = async (data: TErkhetConfig) => {
    const value = writeConfig(data);
    await createConfig({
      variables: { code: CONFIG_CODE, subId: value.stageId, value },
    });
    await refetch();
    toast({ title: t('success'), description: t('config-created-successfully') });
  };

  const editConfig = async (id: string, data: TErkhetConfig) => {
    const value = writeConfig(data);
    await updateConfig({
      variables: { id, subId: value.stageId, value },
    });
    await refetch();
    toast({ title: t('success'), description: t('config-updated-successfully') });
  };

  const deleteConfig = async (id: string) => {
    await removeConfig({ variables: { id } });
    await refetch();
    toast({ title: t('success'), description: t('config-deleted-successfully') });
  };

  const deleteManyConfigs = async (ids: string[]) => {
    await Promise.all(ids.map((id) => removeConfig({ variables: { id } })));
    await refetch();
    toast({ title: t('success'), description: t('configs-deleted', { count: ids.length }) });
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

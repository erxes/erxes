import { useMutation, useQuery } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TReturnErkhetConfig } from '../types';
import {
  CREATE_MN_CONFIG,
  GET_MN_CONFIGS,
  REMOVE_MN_CONFIG,
  UPDATE_MN_CONFIG,
} from '@/shared/graphql/mnConfigs';

const CONFIG_CODE = 'returnEbarimtConfig';

export type TReturnErkhetConfigRow = TReturnErkhetConfig & { _id: string };

const parseConfigValue = (value: any) =>
  typeof value === 'string' ? JSON.parse(value) : value || {};

export const useReturnErkhetConfigs = () => {
  const { t } = useTranslation('mongolian');
  const { toast } = useToast();

  const { data, loading, refetch } = useQuery(GET_MN_CONFIGS, {
    variables: { code: CONFIG_CODE },
    fetchPolicy: 'cache-and-network',
  });

  const configs: TReturnErkhetConfigRow[] = (data?.mnConfigs || []).map(
    (config: any) => ({
      _id: config._id,
      subId: config.subId,
      ...parseConfigValue(config.value),
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

  const addConfig = async (data: TReturnErkhetConfig) => {
    await createConfig({
      variables: { code: CONFIG_CODE, subId: data.stageId, value: data },
    });
    await refetch();
    toast({ title: t('success'), description: t('config-created-successfully') });
  };

  const editConfig = async (id: string, data: TReturnErkhetConfig) => {
    await updateConfig({
      variables: { id, subId: data.stageId, value: data },
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

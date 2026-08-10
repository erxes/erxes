import { useMutation, useQuery } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { GET_CONFIGS_GET_VALUE } from '../graphql/queries/usePipelineRemainderConfigQuery';
import {
  CREATE_PIPELINE_REMAINDER_CONFIG,
  REMOVE_PIPELINE_REMAINDER_CONFIG,
  UPDATE_PIPELINE_REMAINDER_CONFIG,
} from '../graphql/mutations/createPipelineRemainderConfigMutations';
import { AddPipelineRemainderConfig } from '../types';

const CONFIG_CODE = 'remainderConfig';

export type TRemainderConfigRow = AddPipelineRemainderConfig & { _id: string };

const parseConfigValue = (value: any) =>
  typeof value === 'string' ? JSON.parse(value) : value || {};

export const usePipelineRemainderConfigs = () => {
  const { toast } = useToast();
  const { t } = useTranslation('mongolian');

  const { data, loading, refetch } = useQuery(GET_CONFIGS_GET_VALUE, {
    variables: { code: CONFIG_CODE },
    fetchPolicy: 'cache-and-network',
  });

  const configs: TRemainderConfigRow[] = (data?.mnConfigs || []).map(
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
    CREATE_PIPELINE_REMAINDER_CONFIG,
    mutationOptions,
  );
  const [updateConfig, { loading: updateLoading }] = useMutation(
    UPDATE_PIPELINE_REMAINDER_CONFIG,
    mutationOptions,
  );
  const [removeConfig, { loading: removeLoading }] = useMutation(
    REMOVE_PIPELINE_REMAINDER_CONFIG,
    mutationOptions,
  );

  const addConfig = async (data: AddPipelineRemainderConfig) => {
    await createConfig({
      variables: { code: CONFIG_CODE, subId: data.pipelineId, value: data },
    });
    await refetch();
    toast({ title: t('success'), description: t('config-created-successfully') });
  };

  const editConfig = async (id: string, data: AddPipelineRemainderConfig) => {
    await updateConfig({
      variables: { id, subId: data.pipelineId, value: data },
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

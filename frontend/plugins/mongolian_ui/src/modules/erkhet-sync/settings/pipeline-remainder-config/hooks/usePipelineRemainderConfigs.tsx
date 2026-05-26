import { useMutation, useQuery } from '@apollo/client';
import { useToast } from 'erxes-ui';
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
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
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
    toast({ title: 'Success', description: 'Config created successfully' });
  };

  const editConfig = async (id: string, data: AddPipelineRemainderConfig) => {
    await updateConfig({
      variables: { id, subId: data.pipelineId, value: data },
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

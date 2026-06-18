import { useMutation, useQuery } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { GET_CONFIGS_GET_VALUE } from '../graphql/queries/useStageInReturnErkhetConfigQuery';
import {
  CREATE_STAGE_IN_RETURN_ERKHET_CONFIG,
  REMOVE_STAGE_IN_RETURN_ERKHET_CONFIG,
  UPDATE_STAGE_IN_RETURN_ERKHET_CONFIG,
} from '../graphql/mutations/createStageInReturnErkhetConfigMutations';
import { TReturnErkhetConfig } from '../types';

const CONFIG_CODE = 'returnEbarimtConfig';

export type TReturnErkhetConfigRow = TReturnErkhetConfig & { _id: string };

const parseConfigValue = (value: any) =>
  typeof value === 'string' ? JSON.parse(value) : value || {};

export const useReturnErkhetConfigs = () => {
  const { toast } = useToast();

  const { data, loading, refetch } = useQuery(GET_CONFIGS_GET_VALUE, {
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
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    },
  };

  const [createConfig, { loading: createLoading }] = useMutation(
    CREATE_STAGE_IN_RETURN_ERKHET_CONFIG,
    mutationOptions,
  );
  const [updateConfig, { loading: updateLoading }] = useMutation(
    UPDATE_STAGE_IN_RETURN_ERKHET_CONFIG,
    mutationOptions,
  );
  const [removeConfig, { loading: removeLoading }] = useMutation(
    REMOVE_STAGE_IN_RETURN_ERKHET_CONFIG,
    mutationOptions,
  );

  const addConfig = async (data: TReturnErkhetConfig) => {
    await createConfig({
      variables: { code: CONFIG_CODE, subId: data.stageId, value: data },
    });
    await refetch();
    toast({ title: 'Success', description: 'Config created successfully' });
  };

  const editConfig = async (id: string, data: TReturnErkhetConfig) => {
    await updateConfig({
      variables: { id, subId: data.stageId, value: data },
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

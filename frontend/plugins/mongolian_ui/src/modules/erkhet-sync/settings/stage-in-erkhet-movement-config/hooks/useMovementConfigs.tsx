import { useMutation, useQuery } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { GET_CONFIGS_GET_VALUE } from '../graphql/queries/useStageInErkhetMovementConfigQuery';
import {
  CREATE_STAGE_IN_MOVEMENT_ERKHET_CONFIG,
  REMOVE_STAGE_IN_MOVEMENT_ERKHET_CONFIG,
  UPDATE_STAGE_IN_MOVEMENT_ERKHET_CONFIG,
} from '../graphql/mutations/createStageInErkhetMovementConfigMutations';
import { TMovementErkhetConfig } from '../types';

const CONFIG_CODE = 'stageInMoveConfig';

type TConfigRow = TMovementErkhetConfig & { _id: string };

const parseConfigValue = (value: any) =>
  typeof value === 'string' ? JSON.parse(value) : value || {};

const normalizeMovementConfig = (value: any): TMovementErkhetConfig => {
  const parsed = parseConfigValue(value);

  return {
    ...parsed,
    responseField: parsed.responseField || parsed.chooseResponseField || '',
  };
};

const buildMovementConfigValue = (value: TMovementErkhetConfig) => {
  const { chooseResponseField, ...rest } = value as TMovementErkhetConfig & {
    chooseResponseField?: string;
  };

  return {
    ...rest,
    responseField: value.responseField || chooseResponseField || '',
  };
};

export const useMovementConfigs = () => {
  const { toast } = useToast();

  const { data, loading, refetch } = useQuery(GET_CONFIGS_GET_VALUE, {
    variables: { code: CONFIG_CODE },
    fetchPolicy: 'cache-and-network',
  });

  const configs: TConfigRow[] = (data?.mnConfigs || []).map((config: any) => ({
    _id: config._id,
    subId: config.subId,
    ...normalizeMovementConfig(config.value),
  }));

  const [createConfig, { loading: createLoading }] = useMutation(
    CREATE_STAGE_IN_MOVEMENT_ERKHET_CONFIG,
    {
      onError: (e) => {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      },
    },
  );
  const [updateConfig, { loading: updateLoading }] = useMutation(
    UPDATE_STAGE_IN_MOVEMENT_ERKHET_CONFIG,
  );
  const [removeConfig, { loading: removeLoading }] = useMutation(
    REMOVE_STAGE_IN_MOVEMENT_ERKHET_CONFIG,
  );

  const addConfig = async (data: TMovementErkhetConfig) => {
    await createConfig({
      variables: {
        code: CONFIG_CODE,
        subId: data.stageId,
        value: buildMovementConfigValue(data),
      },
    });
    await refetch();
    toast({ title: 'Success', description: 'Config created successfully' });
  };

  const editConfig = async (id: string, data: TMovementErkhetConfig) => {
    await updateConfig({
      variables: {
        id,
        subId: data.stageId,
        value: buildMovementConfigValue(data),
      },
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

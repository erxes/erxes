import { useMutation, useQuery } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { nanoid } from 'nanoid';
import { GET_CONFIGS_GET_VALUE } from '../graphql/queries/useStageInErkhetMovementConfigQuery';
import { CREATE_STAGE_IN_MOVEMENT_ERKHET_CONFIG } from '../graphql/mutations/createStageInErkhetMovementConfigMutations';
import { TMovementErkhetConfig } from '../types';

const CONFIG_CODE = 'stageInMoveConfigs';

type TConfigRow = TMovementErkhetConfig & { _id: string };

const parseConfigs = (value: any): TConfigRow[] => {
  if (!value) return [];
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const useMovementConfigs = () => {
  const { toast } = useToast();

  const { data, loading, refetch } = useQuery(GET_CONFIGS_GET_VALUE, {
    variables: { code: CONFIG_CODE },
    fetchPolicy: 'network-only',
  });

  const configs: TConfigRow[] = parseConfigs(data?.configsGetValue?.value);

  const [saveConfigs, { loading: saveLoading }] = useMutation(
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

  const persist = async (list: TConfigRow[]) => {
    await saveConfigs({
      variables: {
        configsMap: { [CONFIG_CODE]: list },
      },
    });
    await refetch();
  };

  const addConfig = async (data: TMovementErkhetConfig) => {
    const newConfig: TConfigRow = { ...data, _id: nanoid() };
    await persist([...configs, newConfig]);
    toast({ title: 'Success', description: 'Config created successfully' });
  };

  const editConfig = async (id: string, data: TMovementErkhetConfig) => {
    const updated = configs.map((c) =>
      c._id === id ? { ...data, _id: id } : c,
    );
    await persist(updated);
    toast({ title: 'Success', description: 'Config updated successfully' });
  };

  const deleteConfig = async (id: string) => {
    const updated = configs.filter((c) => c._id !== id);
    await persist(updated);
    toast({ title: 'Success', description: 'Config deleted successfully' });
  };

  return {
    configs,
    loading,
    saveLoading,
    addConfig,
    editConfig,
    deleteConfig,
  };
};

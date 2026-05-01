import { useMutation, useQuery } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { nanoid } from 'nanoid';
import { GET_CONFIGS_GET_VALUE } from '../graphql/queries/useStageInReturnErkhetConfigQuery';
import { CREATE_STAGE_IN_RETURN_ERKHET_CONFIG } from '../graphql/mutations/createStageInReturnErkhetConfigMutations';
import { TReturnErkhetConfig } from '../types';

const CONFIG_CODE = 'returnErkhetConfigs';

export type TReturnErkhetConfigRow = TReturnErkhetConfig & { _id: string };

const parseConfigs = (value: any): TReturnErkhetConfigRow[] => {
  if (!value) return [];
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const useReturnErkhetConfigs = () => {
  const { toast } = useToast();

  const { data, loading, refetch } = useQuery(GET_CONFIGS_GET_VALUE, {
    variables: { code: CONFIG_CODE },
    fetchPolicy: 'cache-and-network',
  });

  const configs: TReturnErkhetConfigRow[] = parseConfigs(data?.configsGetValue?.value);

  const [saveConfigs, { loading: saveLoading }] = useMutation(
    CREATE_STAGE_IN_RETURN_ERKHET_CONFIG,
    {
      onError: (e) => {
        toast({ title: 'Error', description: e.message, variant: 'destructive' });
      },
    },
  );

  const persist = async (list: TReturnErkhetConfigRow[]) => {
    await saveConfigs({ variables: { configsMap: { [CONFIG_CODE]: list } } });
    await refetch();
  };

  const addConfig = async (data: TReturnErkhetConfig) => {
    await persist([...configs, { ...data, _id: nanoid() }]);
    toast({ title: 'Success', description: 'Config created successfully' });
  };

  const editConfig = async (id: string, data: TReturnErkhetConfig) => {
    await persist(configs.map((c) => (c._id === id ? { ...data, _id: id } : c)));
    toast({ title: 'Success', description: 'Config updated successfully' });
  };

  const deleteConfig = async (id: string) => {
    await persist(configs.filter((c) => c._id !== id));
    toast({ title: 'Success', description: 'Config deleted successfully' });
  };

  const deleteManyConfigs = async (ids: string[]) => {
    const idSet = new Set(ids);
    await persist(configs.filter((c) => !idSet.has(c._id)));
    toast({ title: 'Success', description: `${ids.length} config(s) deleted` });
  };

  return { configs, loading, saveLoading, addConfig, editConfig, deleteConfig, deleteManyConfigs };
};

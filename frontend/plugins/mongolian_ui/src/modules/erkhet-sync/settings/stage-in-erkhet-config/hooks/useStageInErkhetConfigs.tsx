import { useMutation, useQuery } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { nanoid } from 'nanoid';
import { GET_CONFIGS_GET_VALUE } from '../graphql/queries/useStageInErkhetConfigQuery';
import { CREATE_STAGE_IN_ERKHET_CONFIG } from '../graphql/mutations/createStageInErkhetConfigMutations';
import { TErkhetConfig } from '../types';

const CONFIG_CODE = 'stageInErkhetConfigs';

export type TStageInErkhetConfigRow = TErkhetConfig & { _id: string };

const parseConfigs = (value: any): TStageInErkhetConfigRow[] => {
  if (!value) return [];
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const useStageInErkhetConfigs = () => {
  const { toast } = useToast();

  const { data, loading, refetch } = useQuery(GET_CONFIGS_GET_VALUE, {
    variables: { code: CONFIG_CODE },
    fetchPolicy: 'cache-and-network',
  });

  const configs: TStageInErkhetConfigRow[] = parseConfigs(data?.configsGetValue?.value);

  const [saveConfigs, { loading: saveLoading }] = useMutation(
    CREATE_STAGE_IN_ERKHET_CONFIG,
    {
      onError: (e) => {
        toast({ title: 'Error', description: e.message, variant: 'destructive' });
      },
    },
  );

  const persist = async (list: TStageInErkhetConfigRow[]) => {
    await saveConfigs({ variables: { configsMap: { [CONFIG_CODE]: list } } });
    await refetch();
  };

  const addConfig = async (data: TErkhetConfig) => {
    await persist([...configs, { ...data, _id: nanoid() }]);
    toast({ title: 'Success', description: 'Config created successfully' });
  };

  const editConfig = async (id: string, data: TErkhetConfig) => {
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

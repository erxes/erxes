import { useMutation, useQuery } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { nanoid } from 'nanoid';
import { GET_CONFIGS_GET_VALUE } from '../graphql/queries/usePipelineRemainderConfigQuery';
import { CREATE_PIPELINE_REMAINDER_CONFIG } from '../graphql/mutations/createPipelineRemainderConfigMutations';
import { AddPipelineRemainderConfig } from '../types';

const CONFIG_CODE = 'remainderConfigs';

export type TRemainderConfigRow = AddPipelineRemainderConfig & { _id: string };

const parseConfigs = (value: any): TRemainderConfigRow[] => {
  if (!value) return [];
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const usePipelineRemainderConfigs = () => {
  const { toast } = useToast();

  const { data, loading, refetch } = useQuery(GET_CONFIGS_GET_VALUE, {
    variables: { code: CONFIG_CODE },
    fetchPolicy: 'cache-and-network',
  });

  const configs: TRemainderConfigRow[] = parseConfigs(data?.configsGetValue?.value);

  const [saveConfigs, { loading: saveLoading }] = useMutation(
    CREATE_PIPELINE_REMAINDER_CONFIG,
    {
      onError: (e) => {
        toast({ title: 'Error', description: e.message, variant: 'destructive' });
      },
    },
  );

  const persist = async (list: TRemainderConfigRow[]) => {
    await saveConfigs({ variables: { configsMap: { [CONFIG_CODE]: list } } });
    await refetch();
  };

  const addConfig = async (data: AddPipelineRemainderConfig) => {
    const newConfig: TRemainderConfigRow = { ...data, _id: nanoid() };
    await persist([...configs, newConfig]);
    toast({ title: 'Success', description: 'Config created successfully' });
  };

  const editConfig = async (id: string, data: AddPipelineRemainderConfig) => {
    const updated = configs.map((c) => (c._id === id ? { ...data, _id: id } : c));
    await persist(updated);
    toast({ title: 'Success', description: 'Config updated successfully' });
  };

  const deleteConfig = async (id: string) => {
    const updated = configs.filter((c) => c._id !== id);
    await persist(updated);
    toast({ title: 'Success', description: 'Config deleted successfully' });
  };

  const deleteManyConfigs = async (ids: string[]) => {
    const idSet = new Set(ids);
    const updated = configs.filter((c) => !idSet.has(c._id));
    await persist(updated);
    toast({ title: 'Success', description: `${ids.length} config(s) deleted` });
  };

  return { configs, loading, saveLoading, addConfig, editConfig, deleteConfig, deleteManyConfigs };
};

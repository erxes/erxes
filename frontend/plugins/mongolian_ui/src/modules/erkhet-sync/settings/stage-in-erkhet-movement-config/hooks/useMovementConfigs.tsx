import { useMutation, useQuery } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TMovementErkhetConfig } from '../types';
import {
  CREATE_MN_CONFIG,
  GET_MN_CONFIGS,
  REMOVE_MN_CONFIG,
  UPDATE_MN_CONFIG,
} from '@/shared/graphql/mnConfigs';

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
  const { t } = useTranslation('mongolian');
  const { toast } = useToast();

  const { data, loading, refetch } = useQuery(GET_MN_CONFIGS, {
    variables: { code: CONFIG_CODE },
    fetchPolicy: 'cache-and-network',
  });

  const configs: TConfigRow[] = (data?.mnConfigs || []).map((config: any) => ({
    _id: config._id,
    subId: config.subId,
    ...normalizeMovementConfig(config.value),
  }));

  const [createConfig, { loading: createLoading }] = useMutation(
    CREATE_MN_CONFIG,
    {
      onError: (e) => {
        toast({
          title: t('error'),
          description: e.message,
          variant: 'destructive',
        });
      },
    },
  );
  const [updateConfig, { loading: updateLoading }] = useMutation(
    UPDATE_MN_CONFIG,
  );
  const [removeConfig, { loading: removeLoading }] = useMutation(
    REMOVE_MN_CONFIG,
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
    toast({ title: t('success'), description: t('config-created-successfully') });
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

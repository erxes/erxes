import { useMutation, useQuery } from '@apollo/client';

import { useConfirm, useToast } from 'erxes-ui';

import {
  fileSettingsMutations,
  fileSettingsQueries,
} from '@/settings/file-upload/graphql';

const useConfig = () => {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const confirmOptions = { confirmationValue: 'update' };

  const { data, loading } = useQuery(fileSettingsQueries.GET_CONFIGS, {
    onError(error) {
      console.error(error.message);
    },
  });

  const [update, { loading: isLoading }] = useMutation(
    fileSettingsMutations.UPDATE_CONFIGS,
    {
      onError(error) {
        console.error(error.message);
      },
      onCompleted() {
        toast({
          title: 'Success',
          description: 'Configs updated successfully',
          variant: 'success',
        });
      },
      refetchQueries: ['Configs'],
      awaitRefetchQueries: true,
    },
  );

  const updateConfig = (args: any, options?: { skipConfirm?: boolean }) => {
    if (options?.skipConfirm) {
      return update({ variables: { configsMap: { ...args } } });
    }

    confirm({
      message: 'Are you sure you want to update file configs?',
      options: confirmOptions,
    })
      .then(() => update({ variables: { configsMap: { ...args } } }))
      .catch((e) => {
        console.error(e);
      });
  };

  const configs = data?.configs || undefined;

  return {
    configs,
    loading,
    updateConfig,
    isLoading,
  };
};

export { useConfig };

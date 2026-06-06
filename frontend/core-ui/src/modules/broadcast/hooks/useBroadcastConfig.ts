import { useMutation } from '@apollo/client';

import { useConfirm } from 'erxes-ui';

import { BROADCAST_UPDATE_CONFIGS } from '../graphql/mutations';

const useBroadcastConfig = () => {
  const { confirm } = useConfirm();
  const confirmOptions = { confirmationValue: 'update' };

  const [update, { loading: isLoading }] = useMutation(
    BROADCAST_UPDATE_CONFIGS,
    {
      onError(error) {
        console.error(error.message);
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

  return {
    updateConfig,
    isLoading,
  };
};

export { useBroadcastConfig };

import { useState } from 'react';
import { useCreateEbarimtReturnConfig } from '@/ebarimt/settings/stage-in-return-ebarimt-config/hooks/useCreateEbarimtReturnConfig';
import { useNotification } from '@/ebarimt/settings/stage-in-return-ebarimt-config/hooks/useNotification';

type OperationType = 'create' | 'update' | 'delete';

export const useEbarimtReturnConfigSave = () => {
  const { createEbarimtReturnConfig } = useCreateEbarimtReturnConfig();
  const { showConfigCreated, showConfigUpdated, showConfigDeleted, showError } =
    useNotification();
  const [loading, setLoading] = useState(false);

  const saveConfigsToServer = async (
    configs: any,
    refetch: () => void,
    operation: OperationType = 'update',
  ) => {
    setLoading(true);
    try {
      await createEbarimtReturnConfig({
        variables: {
          configsMap: {
            returnStageInEbarimt: configs,
          },
        },
      });

      switch (operation) {
        case 'create':
          showConfigCreated();
          break;
        case 'update':
          showConfigUpdated();
          break;
        case 'delete':
          showConfigDeleted();
          break;
      }

      refetch();
    } catch (error) {
      console.error('Error saving configs:', error);
      showError('Failed to save configuration');
      refetch();
    } finally {
      setLoading(false);
    }
  };

  return {
    saveConfigsToServer,
    loading,
  };
};

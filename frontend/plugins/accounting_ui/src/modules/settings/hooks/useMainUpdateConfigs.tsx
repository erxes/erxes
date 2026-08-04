import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { ACCOUNTINGS_MAIN_CONFIGS_UPDATE } from '../graphql/mutations/updateConfig';

export const useMainUpdateConfigs = () => {
  const [updateConfig, { loading }] = useMutation(
    ACCOUNTINGS_MAIN_CONFIGS_UPDATE,
  );

  const updateConfigs = (configsMap: Record<string, any>) => {
    return updateConfig({
      variables: { configsMap },
      refetchQueries: ['accountingsConfigs'],
      onError: (error) => {
        toast({
          title: 'Алдаа',
          description: error.message,
          variant: 'destructive',
        });
      },
      onCompleted: () => {
        toast({
          title: 'Амжилттай',
          description: 'Тохиргоог хадгаллаа',
        });
      },
    });
  };

  return {
    updateConfigs,
    loading,
  };
};

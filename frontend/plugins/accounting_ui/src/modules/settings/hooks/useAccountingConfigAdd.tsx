import { useTranslation } from 'react-i18next';
import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { ACCOUNTINGS_CONFIGS_ADD } from '../graphql/mutations/updateConfig';
import { toast } from 'erxes-ui';

export const useAccountingConfigAdd = (options?: MutationFunctionOptions) => {
  const { t } = useTranslation('accounting');

  const [configAdd, { loading, error }] = useMutation(ACCOUNTINGS_CONFIGS_ADD);

  const addConfig = ({
    code,
    subId,
    value,
  }: {
    code: string;
    subId?: string;
    value: any;
  }) => {
    return configAdd({
      ...options,
      variables: {
        code,
        subId,
        value,
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
        options?.onError?.(error);
      },
      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: t('configuration-created-successfully'),
        });
        options?.onCompleted?.(data);
      },
      refetchQueries: ['AccountingsConfigs'],
    });
  };

  return { addConfig, loading, error };
};

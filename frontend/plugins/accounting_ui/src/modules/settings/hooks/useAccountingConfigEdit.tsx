import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { ACCOUNTINGS_CONFIGS_EDIT } from '../graphql/mutations/updateConfig';
import { toast } from 'erxes-ui';

export const useAccountingConfigEdit = (options?: MutationFunctionOptions<{
  _id: string, code: string, subId?: string, value: any
}, any>) => {
  const [configEdit, { loading, error }] = useMutation(ACCOUNTINGS_CONFIGS_EDIT);

  const editConfig = ({ id, subId, value }: { id: string, subId?: string, value: any }) => {
    return configEdit({
      ...options,
      variables: {
        ...options?.variables,
        _id: id,
        subId,
        value
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        options?.onError?.(error);
      },
      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: 'Updated config',
        });
        options?.onCompleted?.(data);
      },
      refetchQueries: ['AccountingsConfigs'],
    });
  };

  return { editConfig, loading, error };
};

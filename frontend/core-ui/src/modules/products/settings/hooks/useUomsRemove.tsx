import {
  MutationFunctionOptions,
  MutationHookOptions,
  useMutation,
} from '@apollo/client';
import { UOMS_REMOVE } from '../graphql/mutations/cudUoms';
import { useToast } from 'erxes-ui';
export const useUomsRemove = (options?: MutationHookOptions) => {
  const { toast } = useToast();
  const [_removeUoms, { loading, error }] = useMutation(UOMS_REMOVE, options);
  const removeUoms = (options?: MutationFunctionOptions) => {
    _removeUoms({
      ...options,
      onError: (e) => {
        toast({
          title: 'Error',
          description: e?.message,
          variant: 'destructive',
        });
        options?.onError?.(e);
      },
      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: 'Uom removed successfully',
          variant: 'default',
        });
        options?.onCompleted?.(data);
      },
      refetchQueries: ['Uoms'],
    });
  };
  return {
    removeUoms,
    loading,
    error,
  };
};

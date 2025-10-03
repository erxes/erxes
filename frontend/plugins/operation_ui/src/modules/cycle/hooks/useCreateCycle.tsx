import { useMutation, MutationFunctionOptions } from '@apollo/client';
import { CREATE_CYCLE } from '@/cycle/graphql/mutations/createCycle';
import { useToast } from 'erxes-ui';
import { GET_CYCLES } from '@/cycle/graphql/queries/getCycles';
import { useCyclesVariables } from '@/cycle/hooks/useGetCycles';

export const useCreateCycle = () => {
  const { toast } = useToast();
  const [_createCycle, { loading, error }] = useMutation(CREATE_CYCLE);
  const variables = useCyclesVariables({ cursor: '' });
  const createCycle = (options: MutationFunctionOptions) => {
    _createCycle({
      ...options,
      onCompleted: (data) => {
        toast({
          variant: 'default',
          title: 'Cycle created successfully',
        });
        options.onCompleted?.(data);
      },
      onError: (e) => {
        toast({
          variant: 'destructive',
          title: 'Failed to create cycle',
          description: e.message,
        });
        options.onError?.(e);
      },
      refetchQueries: [{ query: GET_CYCLES, variables: variables }],
    });
  };

  return {
    createCycle,
    loading,
    error,
  };
};

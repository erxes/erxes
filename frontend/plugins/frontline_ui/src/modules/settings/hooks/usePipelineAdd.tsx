import { useMutation, MutationFunctionOptions } from '@apollo/client';
import { ADD_PIPELINE } from '@/settings/graphql/mutations/addPipeline';
export const usePipelineAdd = () => {
  const [_addPipeline, { loading, error }] = useMutation(ADD_PIPELINE);

  const addPipeline = (options: MutationFunctionOptions) => {
    _addPipeline({
      ...options,
      refetchQueries: ['GetTicketPipelines'],
    });
  };

  return {
    addPipeline,
    loading,
    error,
  };
};

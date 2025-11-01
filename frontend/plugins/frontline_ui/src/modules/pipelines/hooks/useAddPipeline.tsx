import { useMutation, MutationFunctionOptions } from '@apollo/client';
import { ADD_PIPELINE } from '@/pipelines/graphql/mutations/addPipeline';
export const usePipelineAdd = () => {
  const [_addPipeline, { loading, error }] = useMutation(ADD_PIPELINE);

  const addPipeline = (options: MutationFunctionOptions) => {
    return _addPipeline({
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

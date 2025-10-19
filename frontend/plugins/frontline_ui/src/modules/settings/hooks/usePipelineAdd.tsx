import { useMutation } from '@apollo/client';
import { ADD_PIPELINE } from '@/settings/graphql/mutations/addPipeline';

export const usePipelineAdd = () => {
  const [addPipeline, { loading, error }] = useMutation(ADD_PIPELINE);
  return {
    addPipeline,
    loading,
    error,
  };
};

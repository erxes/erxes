import { useMutation } from '@apollo/client';
import { REMOVE_PIPELINE } from '@/pipelines/graphql/mutations/removePipeline';
import { toast } from 'erxes-ui';

export const usePipelineRemove = () => {
  const [removePipeline, { loading, error }] = useMutation(REMOVE_PIPELINE, {
    onCompleted: (data) => {
      toast({ title: 'Pipeline removed successfully' });
    },
    refetchQueries: ['GetTicketPipelines'],
  });
  return { removePipeline, loading, error };
};

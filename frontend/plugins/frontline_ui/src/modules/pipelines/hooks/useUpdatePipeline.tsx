import {
  ApolloError,
  MutationFunctionOptions,
  useMutation,
} from '@apollo/client';
import { UPDATE_PIPELINE } from '@/pipelines/graphql/mutations/updatePipeline';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type {
  UpdatePipelineMutation,
  UpdatePipelineMutationVariables,
} from '~/gql/graphql';
export const useUpdatePipeline = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.pipelines' });
  const { toast } = useToast();
  const [_updatePipeline, { loading }] = useMutation(UPDATE_PIPELINE);
  const updatePipeline = (
    options: MutationFunctionOptions<
      UpdatePipelineMutation,
      UpdatePipelineMutationVariables
    >,
  ) => {
    return _updatePipeline({
      ...options,
      onCompleted: (data) => {
        toast({
          title: t('success', 'Success!'),
          description: t(
            'pipeline-updated-successfully',
            'Pipeline updated successfully',
          ),
          variant: 'success',
        });
        options.onCompleted?.(data);
      },
      onError: (error: ApolloError) => {
        toast({
          title: t('error', 'Error'),
          variant: 'destructive',
          description: error.message,
        });
        options.onError?.(error);
      },
      refetchQueries: ['GetTicketPipelines', 'GetTicketPipeline'],
    });
  };
  return { updatePipeline, loading };
};

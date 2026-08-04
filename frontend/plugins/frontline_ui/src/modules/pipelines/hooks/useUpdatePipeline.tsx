import {
  ApolloError,
  MutationFunctionOptions,
  useMutation,
} from '@apollo/client';
import { UPDATE_PIPELINE } from '@/pipelines/graphql/mutations/updatePipeline';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
export const useUpdatePipeline = () => {
  const { t } = useTranslation('frontline');
  const { toast } = useToast();
  const [_updatePipeline, { loading }] = useMutation(UPDATE_PIPELINE);
  const updatePipeline = (options: MutationFunctionOptions) => {
    return _updatePipeline({
      ...options,
      onCompleted: (data) => {
        options.onCompleted?.(data);
      },
      onError: (error: ApolloError) => {
        toast({
          title: t('error'),
          variant: 'destructive',
          description: error.message,
        });
        options.onError?.(error);
      },
      refetchQueries: ['GetTicketPipelines'],
    });
  };
  return { updatePipeline, loading };
};

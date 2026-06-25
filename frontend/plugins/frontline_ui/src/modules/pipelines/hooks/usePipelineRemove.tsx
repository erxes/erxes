import { useMutation } from '@apollo/client';
import { REMOVE_PIPELINE } from '@/pipelines/graphql/mutations/removePipeline';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const usePipelineRemove = () => {
  const { t } = useTranslation('frontline');
  const [removePipeline, { loading, error }] = useMutation(REMOVE_PIPELINE, {
    onCompleted: (data) => {
      toast({ title: t('pipeline-removed-successfully') });
    },
    refetchQueries: ['GetTicketPipelines'],
  });
  return { removePipeline, loading, error };
};

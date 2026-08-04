import { DELETE_TICKET_STATUS } from '@/status/graphql/mutation/deleteTicketStatus';
import { GET_TICKET_STATUS_BY_TYPE } from '@/status/graphql/query/getTicketStatusByType';
import { MutationHookOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';

export const useDeleteTicketStatus = (type: number) => {
  const { t } = useTranslation('frontline');
  const { toast } = useToast();
  const { pipelineId } = useParams();
  const [_deleteStatus, { loading, error }] = useMutation(DELETE_TICKET_STATUS);
  const deleteStatus = (options: MutationHookOptions) => {
    return _deleteStatus({
      refetchQueries: [
        {
          query: GET_TICKET_STATUS_BY_TYPE,
          variables: { type, pipelineId },
        },
      ],
      onError: (e) => {
        toast({
          title: t('error'),
          description: e.message,
          variant: 'destructive',
        });
      },
      ...options,
    });
  };
  return { deleteStatus, loading, error };
};

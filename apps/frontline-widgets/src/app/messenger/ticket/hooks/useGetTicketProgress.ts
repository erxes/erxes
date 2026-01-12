import { ApolloError, useLazyQuery } from '@apollo/client';
import { GET_TICKET_PROGRESS } from '../graphql/queries';
import { ITicketCheckProgress } from '../types';
import { toast } from 'erxes-ui';
import { ticketProgressAtom } from '../../states';
import { useSetAtom } from 'jotai';

interface IGetTicketProgressQueryResponse {
  widgetTicketCheckProgress: ITicketCheckProgress;
}

export const useGetTicketProgress = () => {
  const setTicketProgress = useSetAtom(ticketProgressAtom);
  const [getTicketProgress, { loading, error, data }] =
    useLazyQuery<IGetTicketProgressQueryResponse>(GET_TICKET_PROGRESS, {
      fetchPolicy: 'network-only',
      onCompleted: (data) => {
        if (data?.widgetTicketCheckProgress) {
          setTicketProgress(data.widgetTicketCheckProgress);
          toast({
            title: 'Ticket progress fetched successfully',
            description: data.widgetTicketCheckProgress.name,
            variant: 'success',
          });
        }
      },
      onError: (error: ApolloError) => {
        toast({
          title: 'Error fetching ticket progress',
          description: error.message,
          variant: 'destructive',
        });
      },
    });

  const fetchTicketProgress = async (number: string) => {
    if (!number) {
      return;
    }

    await getTicketProgress({
      variables: { number },
    });
  };

  return {
    loading,
    error,
    fetchTicketProgress,
    ticketProgress: data?.widgetTicketCheckProgress,
  };
};

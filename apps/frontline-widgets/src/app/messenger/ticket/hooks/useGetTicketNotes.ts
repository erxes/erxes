import { QueryHookOptions, useQuery } from '@apollo/client';
import { WIDGET_GET_TICKETS_NOTES } from '../graphql';
import { ITicketNote } from '../types';

interface IQueryResponse {
  widgetTicketComments: ITicketNote[];
}

export const useGetTicketNotes = (options?: QueryHookOptions) => {
  const contentId = options?.variables?.contentId as string | undefined;

  const { data, loading, error } = useQuery<IQueryResponse>(
    WIDGET_GET_TICKETS_NOTES,
    {
      ...options,
      variables: { contentId },
      fetchPolicy: 'cache-and-network',
      skip: !contentId,
    },
  );

  return {
    notes: data?.widgetTicketComments || [],
    loading,
    error,
  };
};

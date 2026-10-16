import { useQuery, QueryHookOptions } from '@apollo/client';
import { useMemo } from 'react';
import { GET_TICKET_PIPELINES } from '@/pipelines/graphql/queries/getPipelines';
import { compactList } from '@/shared/utils/cursorList';
import type {
  GetTicketPipelinesQuery,
  GetTicketPipelinesQueryVariables,
} from '~/gql/graphql';

export const useGetPipelines = (
  options?: QueryHookOptions<
    GetTicketPipelinesQuery,
    GetTicketPipelinesQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(GET_TICKET_PIPELINES, {
    ...options,
    variables: {
      ...options?.variables,
      filter: {
        orderBy: {
          createdAt: -1,
        },
        ...(options?.variables?.filter || {}),
      },
    },
  });
  const pipelines = useMemo(
    () =>
      data?.getTicketPipelines?.list
        ? compactList(data.getTicketPipelines.list)
        : undefined,
    [data?.getTicketPipelines?.list],
  );

  return {
    pipelines,
    totalCount: data?.getTicketPipelines?.totalCount,
    loading,
    error,
  };
};

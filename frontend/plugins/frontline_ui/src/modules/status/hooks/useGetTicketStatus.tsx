import { useQuery, QueryHookOptions } from '@apollo/client';
import { useMemo } from 'react';
import { compactList } from '@/shared/utils/cursorList';
import {
  GET_TICKET_STATUS_BY_TYPE,
  GET_TICKET_STATUS_BY_ID,
} from '@/status/graphql/query/getTicketStatusByType';
import { useParams } from 'react-router';
import {
  GET_TICKET_STATUS_BY_PIPELINE,
  GET_ACCESSIBLE_TICKET_STATUSES,
} from '@/status/graphql/query/getTicketStatusesByPipelines';
import type {
  GetAccessibleTicketStatusesQuery,
  GetAccessibleTicketStatusesQueryVariables,
  GetTicketStatusesByTypeQuery,
  GetTicketStatusesByTypeQueryVariables,
  GetTicketStatusesChoicesPipelineQuery,
  GetTicketStatusesChoicesPipelineQueryVariables,
} from '~/gql/graphql';

export const useGetTicketStatus = (
  type: number,
  options?: Omit<
    QueryHookOptions<
      GetTicketStatusesByTypeQuery,
      GetTicketStatusesByTypeQueryVariables
    >,
    'variables'
  >,
) => {
  const { pipelineId } = useParams();
  const { data, loading, error } = useQuery(GET_TICKET_STATUS_BY_TYPE, {
    ...options,
    variables: pipelineId ? { pipelineId, type } : undefined,
    skip: !pipelineId,
  });

  const statuses = useMemo(
    () =>
      data?.getTicketStatusesByType
        ? compactList(data.getTicketStatusesByType)
        : undefined,
    [data?.getTicketStatusesByType],
  );

  return { statuses, loading, error };
};

export const useGetTicketStatusesByPipeline = (
  options?: Omit<
    QueryHookOptions<
      GetTicketStatusesChoicesPipelineQuery,
      GetTicketStatusesChoicesPipelineQueryVariables
    >,
    'variables'
  > & { variables?: { pipelineId?: string | null } },
) => {
  const { pipelineId: routePipelineId } = useParams();
  const pipelineId = options?.variables?.pipelineId ?? routePipelineId;
  const { data, loading, error } = useQuery(GET_TICKET_STATUS_BY_PIPELINE, {
    ...options,
    variables: pipelineId ? { pipelineId } : undefined,
    skip: options?.skip || !pipelineId,
  });

  const statuses = data?.getTicketStatusesChoicesPipeline;

  return { statuses: statuses || [], loading, error };
};

export const useGetTicketStatusById = (_id?: string) => {
  const { data, loading, error } = useQuery(GET_TICKET_STATUS_BY_ID, {
    variables: _id ? { _id } : undefined,
    skip: !_id,
  });

  return { status: data?.getTicketStatus ?? undefined, loading, error };
};

export const useGetAccessibleTicketStatuses = (
  options?: Omit<
    QueryHookOptions<
      GetAccessibleTicketStatusesQuery,
      GetAccessibleTicketStatusesQueryVariables
    >,
    'variables'
  > & { variables?: { pipelineId?: string | null } },
) => {
  const { pipelineId: routePipelineId } = useParams();
  const pipelineId = options?.variables?.pipelineId ?? routePipelineId;
  const { data, loading, error, refetch } = useQuery(
    GET_ACCESSIBLE_TICKET_STATUSES,
    {
      ...options,
      variables: pipelineId ? { pipelineId } : undefined,
      skip: options?.skip || !pipelineId,
    },
  );

  const statuses = data?.getAccessibleTicketStatuses;

  return { statuses: statuses || [], loading, error, refetch };
};

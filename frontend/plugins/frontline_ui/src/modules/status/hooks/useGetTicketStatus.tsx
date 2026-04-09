import { useQuery, QueryHookOptions } from '@apollo/client';
import {
  GET_TICKET_STATUS_BY_TYPE,
  GET_TICKET_STATUS_BY_ID,
} from '@/status/graphql/query/getTicketStatusByType';
import { ITicketStatus, ITicketStatusChoice } from '@/status/types';
import { useParams } from 'react-router';
import {
  GET_TICKET_STATUS_BY_PIPELINE,
  GET_ACCESSIBLE_TICKET_STATUSES,
} from '@/status/graphql/query/getTicketStatusesByPipelines';

interface IUseGetTicketStatusByTypeResponse {
  getTicketStatusesByType: ITicketStatus[];
}

export const useGetTicketStatus = (options?: QueryHookOptions) => {
  const { pipelineId } = useParams();
  const { data, loading, error } = useQuery<IUseGetTicketStatusByTypeResponse>(
    GET_TICKET_STATUS_BY_TYPE,
    {
      ...options,
      variables: {
        pipelineId,
        ...options?.variables,
      },
      skip: !pipelineId,
    },
  );

  const statuses = data?.getTicketStatusesByType;

  return { statuses, loading, error };
};

interface IUseGetTicketStatusByPipelineResponse {
  getTicketStatusesChoicesPipeline: ITicketStatusChoice[];
}

interface IUseGetAccessibleTicketStatusesResponse {
  getAccessibleTicketStatuses: ITicketStatusChoice[];
}

export const useGetTicketStatusesByPipeline = (options?: QueryHookOptions) => {
  const { pipelineId } = useParams();
  const { data, loading, error } =
    useQuery<IUseGetTicketStatusByPipelineResponse>(
      GET_TICKET_STATUS_BY_PIPELINE,
      {
        ...options,
        variables: {
          pipelineId,
          ...options?.variables,
        },
      },
    );

  const statuses = data?.getTicketStatusesChoicesPipeline;

  return { statuses: statuses || [], loading, error };
};

interface IUseGetTicketStatusByIdResponse {
  getTicketStatus: ITicketStatus;
}

export const useGetTicketStatusById = (_id?: string) => {
  const { data, loading, error } = useQuery<IUseGetTicketStatusByIdResponse>(
    GET_TICKET_STATUS_BY_ID,
    {
      variables: { _id },
      skip: !_id,
    },
  );

  return { status: data?.getTicketStatus, loading, error };
};

export const useGetAccessibleTicketStatuses = (options?: QueryHookOptions) => {
  const { pipelineId } = useParams();
  const { data, loading, error } =
    useQuery<IUseGetAccessibleTicketStatusesResponse>(
      GET_ACCESSIBLE_TICKET_STATUSES,
      {
        ...options,
        variables: {
          pipelineId,
          ...options?.variables,
        },
      },
    );

  const statuses = data?.getAccessibleTicketStatuses;

  return { statuses: statuses || [], loading, error };
};

import { useQuery, QueryHookOptions } from '@apollo/client';
import { GET_TICKET_STATUS_BY_TYPE } from '@/status/graphql/query/getTicketStatusByType';
import { ITicketStatus, ITicketStatusChoice } from '@/status/types';
import { useParams } from 'react-router';
import {
  GET_TICKET_STATUS_BY_PIPELINE,
  GET_ACCESSIBLE_TICKET_STATUSES,
} from '@/status/graphql/query/getTicketStatusesByPipelines';

// Enhanced TypeScript interfaces with better typing
interface IUseGetTicketStatusByTypeResponse {
  getTicketStatusesByType: ITicketStatus[];
}

interface IUseGetTicketStatusByPipelineResponse {
  getTicketStatusesChoicesPipeline: ITicketStatusChoice[];
}

interface IUseGetAccessibleTicketStatusesResponse {
  getAccessibleTicketStatuses: ITicketStatusChoice[];
}

// Common hook options with better typing
interface BaseStatusHookOptions extends Omit<QueryHookOptions, 'variables'> {
  pipelineId?: string;
  type?: number;
}

// Enhanced return type with better error handling
interface StatusHookReturn<T> {
  statuses: T[];
  loading: boolean;
  error?: Error;
  refetch: () => void;
}

// Error handling utility
const handleQueryError = (error: any): Error => {
  if (error?.networkError) {
    return new Error(`Network error: ${error.networkError.message}`);
  }
  if (error?.graphQLErrors?.length > 0) {
    return new Error(`GraphQL error: ${error.graphQLErrors[0].message}`);
  }
  return error || new Error('Unknown error occurred');
};

// Base hook factory for better code reuse
const createStatusHook = <T, ResponseType>(
  query: any,
  getResponseData: (data: ResponseType) => T[] | undefined,
  defaultVariables: Record<string, any>,
) => {
  return (options: BaseStatusHookOptions = {}): StatusHookReturn<T> => {
    const { pipelineId: routePipelineId } = useParams();
    const pipelineId = options.pipelineId || routePipelineId;

    const { data, loading, error, refetch } = useQuery<ResponseType>(query, {
      ...options,
      variables: {
        pipelineId,
        ...defaultVariables,
        ...options.variables,
      },
      skip: !pipelineId || options.skip,
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
    });

    const statuses = getResponseData(data) || [];
    const formattedError = error ? handleQueryError(error) : undefined;

    return {
      statuses,
      loading,
      error: formattedError,
      refetch,
    };
  };
};

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

  const statuses = data?.getTicketStatusesByType || [];
  const formattedError = error ? handleQueryError(error) : undefined;

  return {
    statuses,
    loading,
    error: formattedError,
    refetch,
  };
};

// Utility hook for getting status by ID with caching
export const useGetStatusById = (
  statusId: string,
  options: BaseStatusHookOptions = {},
): StatusHookReturn<ITicketStatusChoice> => {
  const { statuses, loading, error, refetch } =
    useGetAccessibleTicketStatuses(options);

  const status = statuses.find((s) => s.value === statusId);

  return {
    statuses: status ? [status] : [],
    loading,
    error,
    refetch,
  };
};

// Hook for getting statuses by type (backward compatibility)
export const useGetTicketStatusByType = useGetTicketStatusesByType;

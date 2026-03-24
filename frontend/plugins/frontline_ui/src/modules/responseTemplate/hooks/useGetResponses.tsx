import { useQuery, QueryHookOptions } from '@apollo/client';
import {
  IResponseTemplate,
  IResponseTemplateFilter,
} from '@/responseTemplate/types';
import { GET_RESPONSES } from '@/responseTemplate/graphql/queries/getResponses';

interface IGetResponsesResponse {
  responseTemplates: {
    list: IResponseTemplate[];
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string;
      endCursor: string;
    };
    totalCount: number;
  };
}

export const useGetResponses = (
  options?: QueryHookOptions<IGetResponsesResponse, IResponseTemplateFilter>,
) => {
  const { data, loading, error } = useQuery<
    IGetResponsesResponse,
    IResponseTemplateFilter
  >(GET_RESPONSES, {
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
  return { responses: data?.responseTemplates?.list, loading, error };
};

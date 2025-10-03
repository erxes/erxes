import { OperationVariables, useQuery } from '@apollo/client';
import {
  GET_COMPANIES,
  GET_ASSIGNED_COMPANIES,
} from '../graphql/queries/getCompanies';
import { ICompany } from '../types';
import { EnumCursorDirection } from 'erxes-ui';

const COMPANIES_LIMIT = 30;
export const useCompanies = (options?: OperationVariables) => {
  const { data, loading, fetchMore, error } = useQuery<{
    companies: {
      list: ICompany[];
      totalCount: number;
      pageInfo: { endCursor: string };
    };
  }>(GET_COMPANIES, {
    ...options,
    variables: {
      limit: COMPANIES_LIMIT,
      ...options?.variables,
    },
  });
  const { list = [], totalCount = 0, pageInfo } = data?.companies || {};

  const handleFetchMore = () => {
    if (!pageInfo || totalCount <= list.length) return;
    fetchMore({
      variables: {
        ...options?.variables,
        cursor: pageInfo?.endCursor,
        direction: EnumCursorDirection.FORWARD,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          companies: {
            list: [
              ...(prev.companies?.list || []),
              ...fetchMoreResult.companies.list,
            ],
            totalCount: fetchMoreResult.companies.totalCount,
            pageInfo: fetchMoreResult.companies.pageInfo,
          },
        });
      },
    });
  };

  return {
    companies: list,
    loading,
    handleFetchMore,
    totalCount,
    error,
  };
};

interface ICompanyInlineData {
  companies?: { list: ICompany[] };
}

export const useCompaniesInline = (options?: OperationVariables) => {
  const { data, loading, error } = useQuery<ICompanyInlineData>(
    GET_ASSIGNED_COMPANIES,
    options,
  );
  return { companies: data?.companies?.list || [], loading, error };
};

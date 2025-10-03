import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  ICursorListResponse,
  mergeCursorData,
  parseDateRangeFromString,
  useMultiQueryState,
  validateFetchMore,
} from 'erxes-ui';
import { GET_COMPANIES } from '@/contacts/companies/graphql/queries/getCompanies';
import { ICompany } from 'ui-modules';
import { companyTotalCountAtom } from '@/contacts/states/CompanyCounts';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
export const COMPANIES_PER_PAGE = 30;

export const useCompanies = (
  options?: QueryHookOptions<ICursorListResponse<ICompany>>,
) => {
  const setCompanyTotalCount = useSetAtom(companyTotalCountAtom);
  const [{ searchValue, tags, created, updated, lastSeen}] =
    useMultiQueryState<{
      searchValue: string;
      tags: string[];
      created: string;
      updated: string;
      lastSeen: string;
    }>(['searchValue', 'tags', 'created', 'updated', 'lastSeen']);
  const companiesQueryVariables = {
    limit: COMPANIES_PER_PAGE,
    searchValue,
    tags,
    dateFilters: JSON.stringify({
          createdAt: {
            gte: parseDateRangeFromString(created)?.from,
            lte: parseDateRangeFromString(created)?.to,
          },
          updatedAt: {
            gte: parseDateRangeFromString(updated)?.from,
            lte: parseDateRangeFromString(updated)?.to,
          },
          lastSeenAt: {
            gte: parseDateRangeFromString(lastSeen)?.from,
            lte: parseDateRangeFromString(lastSeen)?.to,
          },
        }),
    ...options?.variables,
  };
  const { data, loading, fetchMore } = useQuery<ICursorListResponse<ICompany>>(
    GET_COMPANIES,
    {
      ...options,
      variables: companiesQueryVariables,
    },
  );

  const { list: companies, totalCount, pageInfo } = data?.companies || {};

  useEffect(() => {
    if (!totalCount) return;
    setCompanyTotalCount(totalCount);
  }, [totalCount]);

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (!validateFetchMore({ direction, pageInfo })) return;

    fetchMore({
      variables: {
        cursor: pageInfo?.endCursor,
        limit: COMPANIES_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return Object.assign({}, prev, {
          companies: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.companies,
            prevResult: prev.companies,
          }),
        });
      },
    });
  };

  return {
    loading,
    companies,
    totalCount,
    handleFetchMore,
    pageInfo,
    companiesQueryVariables,
  };
};

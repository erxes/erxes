import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_CUSTOMERS } from '@/contacts/customers/graphql/queries/getCustomers';
import { ICustomer } from 'ui-modules';
import {
  useRecordTableCursor,
  mergeCursorData,
  validateFetchMore,
  EnumCursorDirection,
  parseDateRangeFromString,
  ICursorListResponse,
  useMultiQueryState,
  isUndefinedOrNull,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { customerTotalCountAtom } from '@/contacts/states/customerCounts';
import { useEffect } from 'react';
import { useIsCustomerLeadSessionKey } from './useCustomerLeadSessionKey';

const CUSTOMERS_PER_PAGE = 30;

export const useCustomersVariables = (
  variables?: QueryHookOptions<ICursorListResponse<ICustomer>>['variables'],
) => {
  const { isLead } = useIsCustomerLeadSessionKey();
  const [{ searchValue, tags, created, updated, lastSeen, brand, birthday }] =
    useMultiQueryState<{
      searchValue: string;
      tags: string[];
      created: string;
      updated: string;
      lastSeen: string;
      brand: string;
      birthday: string;
    }>([
      'searchValue',
      'tags',
      'created',
      'updated',
      'lastSeen',
      'brand',
      'birthday',
    ]);
  const { sessionKey } = useIsCustomerLeadSessionKey();

  const { cursor } = useRecordTableCursor({
    sessionKey,
  });

  return {
    limit: CUSTOMERS_PER_PAGE,
    orderBy: {
      createdAt: -1,
    },
    cursor,
    searchValue: searchValue || undefined,
    tagIds: tags || undefined,
    brandIds: brand ? [brand] : undefined,
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
      birthDate: {
        gte: parseDateRangeFromString(birthday)?.from,
        lte: parseDateRangeFromString(birthday)?.to,
      },
    }),
    type: isLead ? 'lead' : 'customer',
    ...variables,
  };
};

export const useCustomers = (
  options?: QueryHookOptions<ICursorListResponse<ICustomer>>,
) => {
  const setCustomerTotalCount = useSetAtom(customerTotalCountAtom);
  // Customer Filter implementation

  const variables = useCustomersVariables(options?.variables);
  const { data, loading, fetchMore } = useQuery<ICursorListResponse<ICustomer>>(
    GET_CUSTOMERS,
    {
      ...options,
      skip: options?.skip || isUndefinedOrNull(variables.cursor),
      variables,
    },
  );

  const { list: customers, pageInfo, totalCount } = data?.customers || {};

  useEffect(() => {
    if (!totalCount) return;
    setCustomerTotalCount(totalCount);
  }, [totalCount]);

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (!validateFetchMore({ direction, pageInfo })) {
      return;
    }

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: CUSTOMERS_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return Object.assign({}, prev, {
          customers: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.customers,
            prevResult: prev.customers,
          }),
        });
      },
    });
  };

  return {
    loading,
    customers,
    handleFetchMore,
    pageInfo,
    totalCount,
  };
};

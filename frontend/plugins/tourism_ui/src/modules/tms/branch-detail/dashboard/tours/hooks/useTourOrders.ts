import {
  MutationHookOptions,
  QueryHookOptions,
  useMutation,
  useQuery,
} from '@apollo/client';
import { useEffect, useMemo } from 'react';
import { useCustomers } from 'ui-modules';
import {
  GET_TOUR_ORDERS,
  GET_TOUR_ORDER_DETAIL,
  GET_TOUR_ORDER_CUSTOMER_IDS,
} from '../graphql/queries';
import { EDIT_TOUR_ORDER } from '../graphql/mutation';
import type {
  BmsOrderCustomerIdsQuery,
  BmsOrderCustomerIdsQueryVariables,
  BmsOrderEditMutation,
  BmsOrderEditMutationVariables,
  BmsOrdersQuery,
  BmsOrdersQueryVariables,
} from '~/gql/graphql';
import { compactList } from '~/utils/cursorList';

export type ITourOrder = NonNullable<
  NonNullable<NonNullable<BmsOrdersQuery['bmsOrders']>['list']>[number]
>;

export const useTourOrderDetail = (orderId?: string, open?: boolean) => {
  const { data, loading, error, refetch } = useQuery(GET_TOUR_ORDER_DETAIL, {
    variables: orderId ? { id: orderId } : undefined,
    skip: !orderId || open === false,
  });

  useEffect(() => {
    if (open && orderId) {
      refetch?.();
    }
  }, [open, orderId, refetch]);

  return {
    order: data?.bmsOrderDetail,
    loading,
    error,
    refetch,
  };
};

export const useEditTourOrder = (
  options?: MutationHookOptions<
    BmsOrderEditMutation,
    BmsOrderEditMutationVariables
  >,
) => {
  const [editOrder, { loading, error }] = useMutation(EDIT_TOUR_ORDER, options);

  return { editOrder, loading, error };
};

export const useTourOrders = (
  options?: QueryHookOptions<BmsOrdersQuery, BmsOrdersQueryVariables>,
) => {
  const { data, loading, error, refetch } = useQuery(GET_TOUR_ORDERS, options);

  const list = data?.bmsOrders?.list;
  const orders = useMemo(() => compactList(list), [list]);

  return {
    loading,
    error,
    refetch,
    orders,
    totalCount: data?.bmsOrders?.totalCount ?? 0,
    pageInfo: data?.bmsOrders?.pageInfo,
  };
};

export const useTourOrderCustomerIds = (
  options?: QueryHookOptions<
    BmsOrderCustomerIdsQuery,
    BmsOrderCustomerIdsQueryVariables
  >,
) => {
  const { data, loading, error, refetch } = useQuery(
    GET_TOUR_ORDER_CUSTOMER_IDS,
    options,
  );

  const ids = data?.bmsOrderCustomerIds;
  const customerIds = useMemo(() => compactList(ids), [ids]);

  return {
    loading,
    error,
    refetch,
    customerIds,
  };
};

export const useTourCustomers = (tourId?: string) => {
  const {
    customerIds,
    loading: idsLoading,
    error: idsError,
    refetch,
  } = useTourOrderCustomerIds({
    variables: tourId ? { tourId } : undefined,
    skip: !tourId,
  });

  const {
    customers,
    loading: customersLoading,
    error: customersError,
  } = useCustomers({
    variables: {
      ids: customerIds,
      limit: Math.max(customerIds.length, 30),
    },
    skip: customerIds.length === 0,
    fetchPolicy: 'cache-and-network',
  });

  const orderedCustomers = useMemo(() => {
    if (!customerIds.length || !customers.length) {
      return [];
    }

    const customerMap = new Map(
      customers.map((customer) => [customer._id, customer]),
    );

    return customerIds
      .map((customerId) => customerMap.get(customerId))
      .filter((customer): customer is (typeof customers)[number] => !!customer);
  }, [customerIds, customers]);

  return {
    customerIds,
    customers: orderedCustomers,
    loading: idsLoading || (customerIds.length > 0 && customersLoading),
    error: idsError || customersError,
    refetch,
  };
};

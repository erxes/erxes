import {
  MutationHookOptions,
  QueryHookOptions,
  useMutation,
  useQuery,
} from '@apollo/client';
import { useEffect } from 'react';
import { GET_TOUR_ORDERS, GET_TOUR_ORDER_DETAIL } from '../graphql/queries';
import { EDIT_TOUR_ORDER } from '../graphql/mutation';

export interface ITourOrder {
  _id: string;
  branchId?: string;
  customerId?: string;
  tourId?: string;
  amount?: number;
  status?: string;
  note?: string;
  numberOfPeople?: number;
  type?: string;
  additionalCustomers?: any[];
  isChild?: boolean;
  parent?: string;
  createdAt?: string;
}

type OrderDetailQueryResult = {
  bmsOrderDetail: ITourOrder;
};

type OrderDetailQueryVariables = {
  id: string;
};

type TourOrdersQueryVariables = {
  tourId?: string;
  limit?: number;
  cursor?: string;
  direction?: string;
};

type TourOrdersQueryResult = {
  bmsOrders: {
    list: ITourOrder[];
    totalCount: number;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string;
      endCursor: string;
    };
  };
};

export const useTourOrderDetail = (orderId?: string, open?: boolean) => {
  const { data, loading, error, refetch } = useQuery<
    OrderDetailQueryResult,
    OrderDetailQueryVariables
  >(GET_TOUR_ORDER_DETAIL, {
    variables: { id: orderId || '' },
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
  options?: MutationHookOptions<{ bmsOrderEdit: ITourOrder }, any>,
) => {
  const [editOrder, { loading, error }] = useMutation(EDIT_TOUR_ORDER, options);

  return { editOrder, loading, error };
};

export const useTourOrders = (
  options?: QueryHookOptions<TourOrdersQueryResult, TourOrdersQueryVariables>,
) => {
  const { data, loading, error, refetch } = useQuery<
    TourOrdersQueryResult,
    TourOrdersQueryVariables
  >(GET_TOUR_ORDERS, options);

  return {
    loading,
    error,
    refetch,
    orders: data?.bmsOrders?.list ?? [],
    totalCount: data?.bmsOrders?.totalCount ?? 0,
    pageInfo: data?.bmsOrders?.pageInfo,
  };
};

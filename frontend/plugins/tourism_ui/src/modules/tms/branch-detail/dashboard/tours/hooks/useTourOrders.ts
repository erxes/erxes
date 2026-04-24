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
import { EDIT_TOUR_ORDER, RECORD_ORDER_PAYMENT } from '../graphql/mutation';

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus = 'draft' | 'confirmed' | 'cancelled' | 'completed';

export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded';

export type TravelerType = 'adult' | 'child' | 'infant';

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'qpay' | 'other';

export interface ITourOrderPeople {
  adults: number;
  children: number;
  infants: number;
}

export interface ITourOrderPackage {
  packageId: string;
  title: string;
  minPersons?: number;
  maxPersons?: number;
  accommodationType?: string;
}

export interface ITourOrderPricing {
  adultPrice: number;
  childPrice: number;
  infantPrice: number;
  domesticFlight: number;
  singleSupplement: number;
  subtotal: number;
  totalAmount: number;
}

export interface ITourOrderPrepaid {
  enabled: boolean;
  percent: number;
  amount: number;
  remainingAmount: number;
}

export interface IPaymentTransaction {
  amount: number;
  method: PaymentMethod;
  note?: string;
  paidAt: string;
  recordedBy?: string;
}

export interface ITourOrderPayment {
  status: PaymentStatus;
  paidAmount: number;
  method?: PaymentMethod;
  transactions: IPaymentTransaction[];
}

export interface ITraveler {
  customerId?: string;
  firstName: string;
  lastName: string;
  type: TravelerType;
  passportNumber?: string;
  dateOfBirth?: string;
  nationality?: string;
}

export interface ITourOrder {
  _id: string;
  branchId?: string;
  primaryCustomerId?: string;
  tourId?: string;
  tourName?: string;
  tourStartDate?: string;
  tourEndDate?: string;
  status?: OrderStatus;
  note?: string;
  internalNote?: string;
  createdBy?: string;
  createdAt?: string;
  modifiedAt?: string;
  package?: ITourOrderPackage;
  people?: ITourOrderPeople;
  pricing?: ITourOrderPricing;
  prepaid?: ITourOrderPrepaid;
  payment?: ITourOrderPayment;
  travelers?: ITraveler[];
}

// ─── Query / mutation types ───────────────────────────────────────────────────

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

type TourOrderCustomerIdsQueryResult = {
  bmsOrderCustomerIds: string[];
};

type TourOrderCustomerIdsQueryVariables = {
  tourId: string;
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

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

export const useRecordOrderPayment = (
  options?: MutationHookOptions<{ bmsOrderRecordPayment: ITourOrder }, any>,
) => {
  const [recordPayment, { loading, error }] = useMutation(
    RECORD_ORDER_PAYMENT,
    options,
  );
  return { recordPayment, loading, error };
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

export const useTourOrderCustomerIds = (
  options?: QueryHookOptions<
    TourOrderCustomerIdsQueryResult,
    TourOrderCustomerIdsQueryVariables
  >,
) => {
  const { data, loading, error, refetch } = useQuery<
    TourOrderCustomerIdsQueryResult,
    TourOrderCustomerIdsQueryVariables
  >(GET_TOUR_ORDER_CUSTOMER_IDS, options);

  return {
    loading,
    error,
    refetch,
    customerIds: data?.bmsOrderCustomerIds ?? [],
  };
};

export const useTourCustomers = (tourId?: string) => {
  const {
    customerIds,
    loading: idsLoading,
    error: idsError,
    refetch,
  } = useTourOrderCustomerIds({
    variables: { tourId: tourId || '' },
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
    if (!customerIds.length || !customers.length) return [];
    const customerMap = new Map(
      customers.map((customer) => [customer._id, customer]),
    );
    return customerIds
      .map((id) => customerMap.get(id))
      .filter((c): c is (typeof customers)[number] => !!c);
  }, [customerIds, customers]);

  return {
    customerIds,
    customers: orderedCustomers,
    loading: idsLoading || (customerIds.length > 0 && customersLoading),
    error: idsError || customersError,
    refetch,
  };
};

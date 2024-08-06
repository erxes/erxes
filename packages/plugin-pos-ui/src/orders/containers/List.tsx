import { Alert, Bulk, router } from "@erxes/ui/src";
import {
  OrdersQueryResponse,
  OrdersSummaryQueryResponse,
  PosOrderReturnBillMutationResponse,
} from "../types";
import { mutations, queries } from "../graphql";

import { FILTER_PARAMS } from "../../constants";
import { IQueryParams } from "@erxes/ui/src/types";
import List from "../components/List";
import React from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
};

const ListContainer = (props: Props) => {
  const { queryParams } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const ordersQuery = useQuery<OrdersQueryResponse>(gql(queries.posOrders), {
    variables: generateParams({ queryParams }),
    fetchPolicy: "network-only",
  });

  const ordersSummaryQuery = useQuery<OrdersSummaryQueryResponse>(
    gql(queries.posOrdersSummary),
    {
      variables: generateParams({ queryParams }),
      fetchPolicy: "network-only",
    }
  );

  const [posOrderReturnBill] = useMutation<PosOrderReturnBillMutationResponse>(
    gql(mutations.posOrderReturnBill)
  );

  const onSearch = (search: string) => {
    router.removeParams(navigate, location, "page");

    if (!search) {
      return router.removeParams(navigate, location, "search");
    }

    router.setParams(navigate, location, { search });
  };

  const onSelect = (values: string[] | string, key: string) => {
    router.removeParams(navigate, location, "page");

    if (queryParams[key] === values) {
      return router.removeParams(navigate, location, key);
    }

    return router.setParams(navigate, location, { [key]: values });
  };

  const onFilter = (filterParams: IQueryParams) => {
    router.removeParams(navigate, location, "page");

    const setParams: any = {}

    for (const key of new Set([...Object.keys(queryParams), ...Object.keys(filterParams)])) {
      if (filterParams[key]) {
        setParams[key] = filterParams[key];
      } else {
        setParams[key] = undefined;
      }
    }
    router.setParams(navigate, location, { ...setParams });

    return router;
  };

  const isFiltered = (): boolean => {
    for (const param in queryParams) {
      if (FILTER_PARAMS.includes(param)) {
        return true;
      }
    }

    return false;
  };

  const clearFilter = () => {
    router.removeParams(navigate, location, ...Object.keys(queryParams));
  };

  const onReturnBill = (posId) => {
    posOrderReturnBill({
      variables: { _id: posId },
    })
      .then(() => {
        // refresh queries
        ordersQuery.refetch();

        Alert.success("You successfully synced erkhet.");
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const ordersList = (bulkProps) => {
    const summary = ordersSummaryQuery?.data?.posOrdersSummary;
    const list = ordersQuery?.data?.posOrders || [];

    const updatedProps = {
      ...props,
      orders: list,
      summary,
      loading: ordersQuery?.data?.loading,

      onFilter,
      onSelect,
      onSearch,
      isFiltered: isFiltered(),
      clearFilter,
      onReturnBill,
    };

    return <List {...updatedProps} {...bulkProps} />;
  };

  const refetch = () => {
    ordersQuery.refetch();
  };

  return <Bulk content={ordersList} refetch={refetch} />;
};

export const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  sortField: queryParams.sortField,
  sortDirection: queryParams.sortDirection
    ? parseInt(queryParams.sortDirection, 10)
    : undefined,
  search: queryParams.search,
  paidStartDate: queryParams.paidStartDate,
  paidEndDate: queryParams.paidEndDate,
  createdStartDate: queryParams.createdStartDate,
  createdEndDate: queryParams.createdEndDate,
  paidDate: queryParams.paidDate,
  userId: queryParams.userId,
  customerId: queryParams.customerId,
  customerType: queryParams.customerType,
  posId: queryParams.posId,
  types: queryParams.types && queryParams.types.split(","),
  statuses: queryParams.statuses && queryParams.statuses.split(","),
  excludeStatuses:
    queryParams.excludeStatuses && queryParams.excludeStatuses.split(","),
});

export default ListContainer;

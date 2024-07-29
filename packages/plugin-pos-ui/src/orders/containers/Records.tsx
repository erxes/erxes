import { Bulk, Spinner, getEnv, router } from "@erxes/ui/src";
import {
  OrderRecordsQueryResponse,
  OrderRecordsCountQueryResponse,
} from "../types";

import { FILTER_PARAMS } from "../../constants";
import { IQueryParams } from "@erxes/ui/src/types";
import React from "react";
import Records from "../components/Records";
import { generateParams } from "./List";
import { gql, useQuery } from "@apollo/client";
import { queries } from "../graphql";
import queryString from "query-string";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
};

const RecordsContainer = (props: Props) => {
  const { queryParams } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const ordersQuery = useQuery<OrderRecordsQueryResponse>(
    gql(queries.posOrderRecords),
    {
      variables: generateParams({ queryParams } || {}),
      fetchPolicy: "network-only",
    }
  );

  const ordersCountQuery = useQuery<OrderRecordsCountQueryResponse>(
    gql(queries.posOrderRecordsCount),
    {
      variables: generateParams({ queryParams } || {}),
      fetchPolicy: "network-only",
    }
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

  const ordersList = (bulkProps) => {
    const list = ordersQuery?.data?.posOrderRecords || [];
    const count = ordersCountQuery?.data?.posOrderRecordsCount || [];

    const exportOrderRecords = (headers) => {
      const { REACT_APP_API_URL } = getEnv();
      const params = generateParams({ queryParams });

      const stringified = queryString.stringify({
        ...params,
      });

      window.open(
        `${REACT_APP_API_URL}/pl:pos/file-export?${stringified}`,
        "_blank"
      );
    };

    const updatedProps = {
      ...props,
      orders: list,
      count,
      loading: ordersQuery.loading,

      onFilter,
      onSelect,
      onSearch,
      isFiltered: isFiltered(),
      clearFilter,
      exportRecord: exportOrderRecords,
    };

    return <Records {...updatedProps} {...bulkProps} />;
  };

  const refetch = () => {
    ordersQuery.refetch();
  };

  if (ordersQuery.loading || ordersCountQuery.loading) {
    return <Spinner />;
  }

  return <Bulk content={ordersList} refetch={refetch} />;
};

export default RecordsContainer;

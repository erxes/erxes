import { gql } from "@apollo/client";
import PutResponseByDate from "../components/PutResponsesByDate";
import queryString from "query-string";
import React from "react";
import { Spinner } from "@erxes/ui/src/components";
import { Alert, router } from "@erxes/ui/src/utils";
import { IQueryParams } from "@erxes/ui/src/types";
import {
  PutResponsesAmountQueryResponse,
  PutResponsesByDateQueryResponse,
  PutResponsesCountQueryResponse,
} from "../types";
import { queries } from "../graphql";
import { FILTER_PARAMS } from "../constants";
import { useQuery } from "@apollo/client";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
};

const generateQueryParams = (location) => {
  return queryString.parse(location.search);
};

const PutResponsesContainer: React.FC<Props> = (props) => {
  const { queryParams } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const putResponsesByDateQuery = useQuery<PutResponsesByDateQueryResponse>(
    gql(queries.putResponsesByDate),
    {
      variables: generateParams({ queryParams }),
      fetchPolicy: "network-only",
    }
  );
  const putResponsesCountQuery = useQuery<PutResponsesCountQueryResponse>(
    gql(queries.putResponsesCount),
    {
      variables: generateParams({ queryParams }),
      fetchPolicy: "network-only",
    }
  );
  const putResponsesAmountQuery = useQuery<PutResponsesAmountQueryResponse>(
    gql(queries.putResponsesAmount),
    {
      variables: generateParams({ queryParams }),
      fetchPolicy: "network-only",
    }
  );

  const onSearch = (search: string, key?: string) => {
    router.removeParams(navigate, location, "page");

    if (!search) {
      return router.removeParams(navigate, location, key || "search");
    }

    router.setParams(navigate, location, { [key || "search"]: search });
  };

  const onSelect = (values: string[] | string, key: string) => {
    const params = generateQueryParams(location);
    router.removeParams(navigate, location, "page");

    if (params[key] === values) {
      return router.removeParams(navigate, location, key);
    }

    return router.setParams(navigate, location, { [key]: values });
  };

  const onFilter = (filterParams: IQueryParams) => {
    router.setParams(navigate, location, filterParams);

    return router;
  };

  const isFiltered = (): boolean => {
    const params = generateQueryParams(location);

    for (const param in params) {
      if (FILTER_PARAMS.includes(param)) {
        return true;
      }
    }

    return false;
  };

  const clearFilter = () => {
    const params = generateQueryParams(location);
    router.removeParams(navigate, location, ...Object.keys(params));
  };

  if (
    putResponsesByDateQuery.loading ||
    putResponsesCountQuery.loading ||
    putResponsesAmountQuery.loading
  ) {
    return <Spinner />;
  }

  let errorMsg: string = "";
  if (putResponsesByDateQuery.error) {
    errorMsg = putResponsesByDateQuery.error.message;
    Alert.error(errorMsg);
  }

  const searchValue = queryParams.searchValue || "";
  const putResponses =
    (putResponsesByDateQuery.data &&
      putResponsesByDateQuery.data.putResponsesByDate) ||
    [];
  const putResponsesCount =
    (putResponsesCountQuery.data &&
      putResponsesCountQuery.data.putResponsesCount) ||
    0;
  const putResponsesAmount =
    (putResponsesAmountQuery.data &&
      putResponsesAmountQuery.data.putResponsesAmount) ||
    0;

  const updatedProps = {
    ...props,
    errorMsg,
    searchValue,
    putResponses,
    totalCount: putResponsesCount,
    sumAmount: putResponsesAmount,
    loading: putResponsesByDateQuery.loading,

    onFilter: onFilter,
    onSelect: onSelect,
    onSearch: onSearch,
    isFiltered: isFiltered(),
    clearFilter: clearFilter,
  };

  return <PutResponseByDate {...updatedProps} />;
};

const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  sortField: queryParams.sortField,
  sortDirection: queryParams.sortDirection
    ? parseInt(queryParams.sortDirection, 10)
    : undefined,
  search: queryParams.search,
  contentType: queryParams.contentType,
  success: queryParams.success,
  billType: queryParams.billType,
  billIdRule: queryParams.billIdRule,
  isLast: queryParams.isLast,
  orderNumber: queryParams.orderNumber,
  dealName: queryParams.dealName,
  pipelineId: queryParams.pipelineId,
  stageId: queryParams.stageId,
  createdStartDate: queryParams.createdStartDate,
  createdEndDate: queryParams.createdEndDate,
  paidDate: queryParams.paidDate,
});

export default PutResponsesContainer;

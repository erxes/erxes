import * as compose from "lodash.flowright";
import { gql } from "@apollo/client";
import PutResponseDuplicated from "../components/PutResponsesDuplicated";
import queryString from "query-string";
import React from "react";
import { Spinner } from "@erxes/ui/src/components";
import { router, withProps } from "@erxes/ui/src/utils";
import { graphql } from "@apollo/client/react/hoc";
import { IQueryParams } from "@erxes/ui/src/types";
import {
  ListDuplicatedQueryVariables,
  PutResponsesDuplicatedCountQueryResponse,
  PutResponsesDuplicatedDetailQueryResponse,
  PutResponsesDuplicatedQueryResponse,
} from "../types";
import { queries } from "../graphql";
import { FILTER_PARAMS } from "../constants";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
};

type FinalProps = {
  PutResponsesDuplicatedQuery: PutResponsesDuplicatedQueryResponse;
  PutResponsesDuplicatedCountQuery: PutResponsesDuplicatedCountQueryResponse;
  PutResponsesDuplicatedDetailQuery: PutResponsesDuplicatedDetailQueryResponse;
} & Props;

const generateQueryParams = (location) => {
  return queryString.parse(location.search);
};

const PutResponsesDuplicatedContainer = (props: FinalProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const onSearch = (search: string, key?: string) => {
    router.removeParams(navigate, location, "page");

    if (!search) {
      return router.removeParams(navigate, location, key || "search");
    }

    router.setParams(navigate, location, { [key || "search"]: search });
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

  const { PutResponsesDuplicatedQuery, PutResponsesDuplicatedCountQuery } =
    props;

  if (
    PutResponsesDuplicatedQuery.loading ||
    PutResponsesDuplicatedCountQuery.loading
  ) {
    return <Spinner />;
  }

  let errorMsg: string = "";
  if (PutResponsesDuplicatedQuery.error) {
    errorMsg = PutResponsesDuplicatedQuery.error.message;
  }

  const putResponsesDuplicated =
    PutResponsesDuplicatedQuery.putResponsesDuplicated || [];
  const putResponsesDuplicatedCount =
    PutResponsesDuplicatedCountQuery.putResponsesDuplicatedCount || 0;

  const updatedProps = {
    ...props,
    errorMsg,
    putResponsesDuplicated,
    totalCount: putResponsesDuplicatedCount,
    loading: PutResponsesDuplicatedQuery.loading,

    onFilter,
    onSearch,
    isFiltered: isFiltered(),
    clearFilter,
  };

  return <PutResponseDuplicated {...updatedProps} />;
};

const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  billType: queryParams.billType,
  startDate: queryParams.startDate,
  endDate: queryParams.endDate,
});

export default withProps<Props>(
  compose(
    graphql<
      { queryParams: any },
      PutResponsesDuplicatedQueryResponse,
      ListDuplicatedQueryVariables
    >(gql(queries.putResponsesDuplicated), {
      name: "PutResponsesDuplicatedQuery",
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams }),
        fetchPolicy: "network-only",
      }),
    }),
    graphql<
      { queryParams: any },
      PutResponsesDuplicatedCountQueryResponse,
      ListDuplicatedQueryVariables
    >(gql(queries.putResponsesDuplicatedCount), {
      name: "PutResponsesDuplicatedCountQuery",
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams }),
        fetchPolicy: "network-only",
      }),
    })
  )(PutResponsesDuplicatedContainer)
);

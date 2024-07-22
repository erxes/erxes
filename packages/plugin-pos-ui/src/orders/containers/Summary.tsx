import { Spinner, router } from "@erxes/ui/src";

import { FILTER_PARAMS } from "../../constants";
import { IQueryParams } from "@erxes/ui/src/types";
import React from "react";
import Summary from "../components/Summary";
import { generateParams } from "./List";
import { gql, useQuery } from "@apollo/client";
import { queries } from "../graphql";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
};

const SummaryContainer = (props: Props) => {
  const { queryParams } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const ordersGroupSummaryQuery = useQuery(gql(queries.posOrdersGroupSummary), {
    variables: genParams({ queryParams } || {}),
    fetchPolicy: "network-only",
  });

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

  if (ordersGroupSummaryQuery.loading) {
    return <Spinner />;
  }

  const summary = ordersGroupSummaryQuery?.data?.posOrdersGroupSummary;

  const updatedProps = {
    ...props,
    loading: ordersGroupSummaryQuery.loading,
    summary,
    onFilter,
    onSelect,
    onSearch,
    isFiltered: isFiltered(),
    clearFilter,
  };

  return <Summary {...updatedProps} />;
};

export const genParams = ({ queryParams }) => ({
  ...generateParams({ queryParams }),
  groupField: queryParams.groupField,
});

export default SummaryContainer;

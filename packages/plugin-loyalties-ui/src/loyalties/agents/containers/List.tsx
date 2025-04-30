import { router } from "@erxes/ui/src/utils";
import { Bulk, Spinner } from "@erxes/ui/src/components";
import { queries } from "../graphql";
import { useQuery } from "@apollo/client";

import List from "../components/List";
import React from "react";
import { gql } from "@apollo/client";

type Props = {
  queryParams: any;
};

const AgentListContainer = ({ queryParams }: Props) => {
  const {
    loading,
    data,
    refetch: refetchMainQuery,
  } = useQuery(gql(queries.agents), {
    variables: generateParams(queryParams),
    fetchPolicy: "network-only",
  });

  if (loading) {
    return <Spinner />;
  }

  const list = data?.agents || [];
  const totalCount = 0;

  const updatedProps = {
    totalCount,
    searchValue: queryParams.searchValue || "",
    agents: list,
  };

  const refetch = () => {
    refetchMainQuery();
  };

  const agentList = (props) => {
    return <List {...updatedProps} {...props} />;
  };

  return <Bulk content={agentList} refetch={refetch} />;
};

const generateParams = (queryParams) => ({
  ...router.generatePaginationParams(queryParams || {}),
  ids: queryParams.ids,
  agentId: queryParams.agentId,
  status: queryParams.status,
  searchValue: queryParams.searchValue,
  sortField: queryParams.sortField,
  sortDirection: Number(queryParams.sortDirection) || undefined,
});

export default AgentListContainer;

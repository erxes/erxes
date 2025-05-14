import { Alert, router, confirm } from "@erxes/ui/src/utils";
import { Bulk, Spinner } from "@erxes/ui/src/components";
import { mutations, queries } from "../graphql";
import { useMutation, useQuery } from "@apollo/client";

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
  const [remove] = useMutation(gql(mutations.agentsRemove));

  if (loading) {
    return <Spinner />;
  }

  const list = data?.agents || [];
  const totalCount = 0;

  const removeAgent = (_id: string) => {
    confirm()
      .then(() => {
        remove({ variables: { _id } }).then(({ data }) => {
          const { agentsRemove } = data;

          if (agentsRemove.acknowledged && agentsRemove.deletedCount === 1) {
            Alert.success('Agent has been deleted.');
          }

          refetchMainQuery();
        }).catch(e => {
          Alert.error(e.message);
        })
      });
  };

  const updatedProps = {
    totalCount,
    searchValue: queryParams.searchValue || "",
    agents: list,
    removeAgent
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

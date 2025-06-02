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
  } = useQuery(gql(queries.agentsMain), {
    variables: generateParams(queryParams),
    fetchPolicy: "network-only",
  });
  const [remove] = useMutation(gql(mutations.agentsRemove));

  if (loading) {
    return <Spinner />;
  }

  const { agentsMain } = data;
  const list = agentsMain?.list || [];
  const totalCount = agentsMain?.totalCount || 0;

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

  const refetch = () => {
    refetchMainQuery();
  };

  const updatedProps = {
    totalCount,
    number: queryParams.number || "",
    agents: list,
    removeAgent,
    queryParams
  };

  const agentList = (props) => {
    return <List {...updatedProps} {...props} />;
  };

  return <Bulk content={agentList} refetch={refetch} />;
};

const generateParams = (queryParams) => ({
  ...router.generatePaginationParams(queryParams || {}),
  customerIds: queryParams.customerIds,
  companyIds: queryParams.companyIds,
  status: queryParams.status,
  number: queryParams.number,
});

export default AgentListContainer;

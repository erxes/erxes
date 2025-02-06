import { Config, IUser, Store } from "../../types";
import { gql, useQuery, WatchQueryFetchPolicy } from "@apollo/client";
import { AppConsumer } from "../../appContext";
import List from "../components/List";
import React from "react";
import Spinner from "../../common/Spinner";
import { queries } from "../graphql";
import { getType } from '../../common/utils';

type Props = {
  currentUser: IUser;
  config: Config;
  type: "task" | "ticket" | "deal" | "purchase";
};

function ListContainer({ currentUser, type, config, ...props }: Props) {
  const pipelineId = config[`${type}PipelineId`];
  const customerId = currentUser?.erxesCustomerId ? [currentUser.erxesCustomerId] : [];

  const fetchPolicy: WatchQueryFetchPolicy = "network-only";

  const queryConfig = {
    skip: !pipelineId,
    fetchPolicy,
    context: { headers: { "erxes-app-token": config?.erxesAppToken } },
  };

  const getQuery = (key: keyof typeof queries) => gql(queries[key]);

  const { loading: loadingStages, data: stagesData = {} } = useQuery(
    getQuery(`${type}Stages` as keyof typeof queries),
    {
      ...queryConfig,
      variables: { pipelineId, customerIds: customerId },
    }
  );

  const { loading: loadingLabels, data: labels = {} } = useQuery(
    getQuery(`${type}PipelineLabels` as keyof typeof queries),
    {
      ...queryConfig,
      variables: { pipelineId },
    }
  );

  const { loading: loadingAssignedUsers, data: assignedUsers = {} } = useQuery(
    getQuery(`${type}PipelineAssignedUsers` as keyof typeof queries),
    {
      ...queryConfig,
      variables: {_id: pipelineId },
    }
  );

  if (loadingStages || loadingLabels || loadingAssignedUsers) {
    return <Spinner objective={true} />;
  }

  const aliasType = getType(type)
 
  const stages = stagesData && stagesData[`${aliasType}sStages`] || [];
  const pipeLinelabels = labels[`${aliasType}sPipelineLabels`] || [];
  const pipelineAssignedUsers = assignedUsers[`${aliasType}sPipelineAssignedUsers`] || [];

  const updatedProps = {
    ...props,
    type,
    config,
    currentUser,
    stages,
    pipeLinelabels,
    pipelineAssignedUsers
  };

  return <List {...updatedProps} />;
}

const WithConsumer = (props) => (
  <AppConsumer>
    {({ currentUser, config }: Store) => (
      <ListContainer {...props} config={config} currentUser={currentUser} />
    )}
  </AppConsumer>
);

export default WithConsumer;

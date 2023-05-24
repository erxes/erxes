import { Config, IUser, Store } from "../../types";
import { gql, useQuery } from "@apollo/client";

import { AppConsumer } from "../../appContext";
import List from "../components/List";
import React from "react";
import Spinner from "../../common/Spinner";
import { queries } from "../graphql";

type Props = {
  currentUser: IUser;
  config: Config;
  type: string;
};

function ListContainer({ currentUser, type, config, ...props }: Props) {
  const { loading: loadingStages, data: stages = {} as any } = useQuery(
    gql(queries.stages),
    {
      skip: !config[`${type}PipelineId` || ""],
      fetchPolicy: "network-only",
      variables: { pipelineId: config[`${type}PipelineId` || ""] },
      context: {
        headers: {
          "erxes-app-token": config?.erxesAppToken,
        },
      },
    }
  );

  const { loading: loadingLable, data: pipeLinelabels = {} as any } = useQuery(
    gql(queries.pipelineLabels),
    {
      skip: !config[`${type}PipelineId` || ""],
      fetchPolicy: "network-only",
      variables: { pipelineId: config[`${type}PipelineId` || ""] },
      context: {
        headers: {
          "erxes-app-token": config?.erxesAppToken,
        },
      },
    }
  );

  const {
    loading: loadingAssignedUsers,
    data: pipelineAssignedUsers = {} as any,
  } = useQuery(gql(queries.pipelineAssignedUsers), {
    skip: !config[`${type}PipelineId` || ""],
    fetchPolicy: "network-only",
    variables: { _id: config[`${type}PipelineId` || ""] },
    context: {
      headers: {
        "erxes-app-token": config?.erxesAppToken,
      },
    },
  });

  if (loadingStages || loadingLable || loadingAssignedUsers) {
    return <Spinner objective={true} />;
  }

  const updatedProps = {
    ...props,
    type,
    config,
    currentUser,
    stages,
    pipeLinelabels,
    pipelineAssignedUsers,
  };

  return <List {...updatedProps} />;
}

const WithConsumer = (props) => {
  return (
    <AppConsumer>
      {({ currentUser, config }: Store) => {
        return (
          <ListContainer {...props} config={config} currentUser={currentUser} />
        );
      }}
    </AppConsumer>
  );
};

export default WithConsumer;

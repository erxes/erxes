import { Config, IUser, Store } from "../../types";
import { gql, useQuery } from "@apollo/client";

import { AppConsumer } from "../../appContext";
import React from "react";
import Spinner from "../../common/Spinner";
import Ticket from "../components/Ticket";
import { queries } from "../graphql";

type Props = {
  currentUser: IUser;
  config: Config;
};

function TicketContainer({ currentUser, ...props }: Props) {
  const { loading: loadingStages, data: stages = {} as any } = useQuery(
    gql(queries.stages),
    {
      skip: !props?.config?.ticketPipelineId,
      fetchPolicy: "network-only",
      variables: { pipelineId: props?.config?.ticketPipelineId },
    }
  );

  const { loading: loadingLable, data: pipeLinelabels = {} as any } = useQuery(
    gql(queries.pipelineLabels),
    {
      skip: !props?.config?.ticketPipelineId,
      fetchPolicy: "network-only",
      variables: { pipelineId: props?.config?.ticketPipelineId },
    }
  );
  const {
    loading: loadingAssignedUsers,
    data: pipelineAssignedUsers = {} as any,
  } = useQuery(gql(queries.pipelineAssignedUsers), {
    skip: !props?.config?.ticketPipelineId,
    fetchPolicy: "network-only",
    variables: { _id: props?.config?.ticketPipelineId },
  });

  if (loadingStages || loadingLable || loadingAssignedUsers) {
    return <Spinner objective={true} />;
  }

  const updatedProps = {
    ...props,
    currentUser,
    stages,
    pipeLinelabels,
    pipelineAssignedUsers,
  };

  return <Ticket {...updatedProps} />;
}

const WithConsumer = (props) => {
  return (
    <AppConsumer>
      {({ currentUser, config }: Store) => {
        return (
          <TicketContainer
            {...props}
            config={config}
            currentUser={currentUser}
          />
        );
      }}
    </AppConsumer>
  );
};

export default WithConsumer;

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
  const { loading, data = {} as any } = useQuery(
    gql(queries.clientPortalTickets),
    {
      skip: !currentUser,
      fetchPolicy: "network-only",
    }
  );

  if (loading) {
    return <Spinner objective={true} />;
  }

  const tickets = data.clientPortalTickets || [];

  const updatedProps = {
    ...props,
    tickets,
    loading,
    currentUser,
  };

  return <Ticket {...updatedProps} />;
}

const WithConsumer = (props) => {
  return (
    <AppConsumer>
      {({ currentUser }: Store) => {
        return <TicketContainer {...props} currentUser={currentUser} />;
      }}
    </AppConsumer>
  );
};

export default WithConsumer;

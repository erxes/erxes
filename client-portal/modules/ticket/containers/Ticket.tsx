import { gql, useQuery } from "@apollo/client";
import React from "react";
import { AppConsumer } from "../../appContext";
import { IUser, Store } from "../../types";
import Ticket from "../components/Ticket";

type Props = {
  currentUser: IUser;
};

const clientPortalTickets = `
  query clientPortalTickets($email: String!) {
    clientPortalTickets(email: $email) {
      _id
      name
      description
      status
      priority
      createdAt
    }
  }
`;

function TicketContainer({ currentUser, ...props }: Props) {
  const { loading, data = {} as any } = useQuery(gql(clientPortalTickets), {
    variables: { email: (currentUser || {}).email },
    skip: !currentUser,
  });

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

import { gql, useMutation } from "@apollo/client";
import React, { useContext } from "react";
import { Config, IUser, Ticket, Store } from "../../types";
import Form from "../components/Form";
import { AppConsumer } from "../../appContext";

type Props = {
  config: Config;
  currentUser: IUser;
};

export const clientPortalCreateTicket = `
  mutation clientPortalCreateCard(
    $type: String!
    $stageId: String!
    $subject: String!
    $description: String
    $email: String!
    $priority: String
  ) {
    clientPortalCreateCard(
      type: $type
      stageId: $stageId
      subject: $subject
      description: $description
      email: $email
      priority: $priority
    ) {
      _id
    }
  }
`;

function FormContainer({ config = {}, currentUser, ...props }: Props) {
  const [createTicket] = useMutation(gql(clientPortalCreateTicket), {
  });

  const handleSubmit = (doc: Ticket) => {
    createTicket({
      variables: {
        ...doc,
        type: "ticket",
        stageId: config.ticketStageId,
        email: currentUser.email,
        priority: "Critical", // TODO: Add select in Form
      },
    }).then(() => {
      // window.location.href = "/tickets";
    });
  };

  const updatedProps = {
    ...props,
    handleSubmit,
  };

  return <Form {...updatedProps} />;
}

const WithConsumer = (props) => {
  return (
    <AppConsumer>
      {({ currentUser, config }: Store) => {
        return (
          <FormContainer {...props} config={config} currentUser={currentUser} />
        );
      }}
    </AppConsumer>
  );
};

export default WithConsumer;

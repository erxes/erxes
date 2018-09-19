import gql from "graphql-tag";
import * as React from "react";
import { ChildProps, graphql } from "react-apollo";
import { IUser } from "../../types";
import { Messenger as DumbMessenger } from "../components";
import { connection } from "../connection";
import graphqTypes from "../graphql";
import { AppConsumer } from "./AppContext";

type QueryResponse = {
  messengerSupporters: IUser[];
};

class MessengerContainer extends React.Component<
  ChildProps<{}, QueryResponse>,
  {}
> {
  render() {
    const { data = { messengerSupporters: [], loading: true } } = this.props;

    return (
      <AppConsumer>
        {({ activeRoute }) => {
          return (
            <DumbMessenger
              activeRoute={activeRoute}
              loading={data.loading}
              supporters={data.messengerSupporters || []}
            />
          );
        }}
      </AppConsumer>
    );
  }
}

const MessengerWithData = graphql<{}, QueryResponse>(
  gql(graphqTypes.messengerSupportersQuery),
  {
    options: () => ({
      variables: {
        integrationId: connection.data.integrationId
      },
      fetchPolicy: "network-only"
    })
  }
)(MessengerContainer);

export default MessengerWithData;

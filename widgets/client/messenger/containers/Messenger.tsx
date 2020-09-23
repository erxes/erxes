import gql from "graphql-tag";
import * as React from "react";
import { ChildProps, graphql } from "react-apollo";
import { Messenger as DumbMessenger } from "../components";
import { connection } from "../connection";
import graphqTypes from "../graphql";
import { IMessengerSupporters } from "../types";
import { AppConsumer } from "./AppContext";

type QueryResponse = {
  widgetsMessengerSupporters: IMessengerSupporters;
};

class MessengerContainer extends React.Component<
  ChildProps<{}, QueryResponse>,
  {}
> {
  render() {
    const { data } = this.props;
    const info = data && data.widgetsMessengerSupporters;
    let supporters: any = [];
    let isOnline = false;

    if (info) {
      if (info.supporters) {
        supporters = info.supporters;
      }
      if (info.isOnline) {
        isOnline = info.isOnline;
      }
    }

    return (
      <AppConsumer>
        {({ activeRoute }) => {
          return (
            <DumbMessenger
              activeRoute={activeRoute}
              loading={false}
              supporters={supporters}
              isOnline={isOnline}
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

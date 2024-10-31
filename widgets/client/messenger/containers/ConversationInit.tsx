import gql from "graphql-tag";
import * as React from "react";
import { ChildProps, graphql } from "react-apollo";
import DumbConversationList from "../components/ConversationInit";
import { connection } from "../connection";
import graphqTypes from "../graphql";
import { IConversation } from "../types";
import { AppConsumer } from "./AppContext";

type QueryResponse = {
  widgetsConversations: IConversation[];
};

class ConversationInit extends React.PureComponent<
  ChildProps<{}, QueryResponse>,
  {}
> {
  render() {
    const { data = { widgetsConversations: [], loading: true } } = this.props;

    let conversations = data.widgetsConversations || [];

    // show empty list while waiting
    if (data.loading) {
      conversations = [];
    }

    return (
      <AppConsumer>
        {({ goToConversation, changeRoute, getMessengerData }) => {
          const createConversation = () => {
            changeRoute("conversationCreate");
          };
          const goToAllConversations = () => {
            changeRoute("allConversations")
          }

          const { responseRate } = getMessengerData();
          return (
            <DumbConversationList
              {...this.props}
              loading={data.loading}
              conversations={conversations}
              goToConversation={goToConversation}
              createConversation={createConversation}
              goToAllConversations={goToAllConversations}
              responseRate={responseRate}
            />
          );
        }}
      </AppConsumer>
    );
  }
}

const ListWithData = graphql<{}, QueryResponse>(
  gql(graphqTypes.allConversations),
  {
    options: () => ({
      fetchPolicy: "network-only",
      variables: connection.data,
      notifyOnNetworkStatusChange: true,
      // every minute
      pollInterval: connection.setting.pollInterval || 0
    })
  }
)(ConversationInit);

export default ListWithData;

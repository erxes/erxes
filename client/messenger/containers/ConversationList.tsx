import gql from "graphql-tag";
import * as React from "react";
import { ChildProps, graphql } from "react-apollo";
import { ConversationList as DumbConversationList } from "../components";
import { connection } from "../connection";
import graphqTypes from "../graphql";
import { IConversation } from "../types";
import { AppConsumer } from "./AppContext";

type QueryResponse = {
  conversations: IConversation[];
};

class ConversationList extends React.Component<
  ChildProps<{}, QueryResponse>,
  {}
> {
  render() {
    const { data = { conversations: [], loading: true } } = this.props;

    let conversations = data.conversations || [];

    // show empty list while waiting
    if (data.loading) {
      conversations = [];
    }

    return (
      <AppConsumer>
        {({ goToConversation }) => {
          return (
            <DumbConversationList
              {...this.props}
              loading={data.loading}
              conversations={conversations}
              goToConversation={goToConversation}
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
      variables: connection.data
    })
  }
)(ConversationList);

export default ListWithData;

import gql from "graphql-tag";
import * as React from "react";
import { ChildProps, compose, graphql } from "react-apollo";
import { IUser } from "../../types";
import { Conversation as DumbConversation } from "../components";
import { connection } from "../connection";
import graphqlTypes from "../graphql";
import { IConversation } from "../types";
import { AppConsumer } from "./AppContext";

type Response = {
  conversationDetail: IConversation;
};

class ConversationCreate extends React.Component<ChildProps<{}, Response>, {}> {
  render() {
    let isOnline = false;
    let loading = true;
    let supporters: IUser[] = [];

    const data = this.props.data;

    if (data && data.conversationDetail) {
      const { conversationDetail } = data;

      loading = data.loading;
      isOnline = conversationDetail.isOnline;
      supporters = conversationDetail.supporters || [];
    }

    return (
      <AppConsumer>
        {({ goToConversationList, getColor }) => {
          return (
            <DumbConversation
              {...this.props}
              isNew={true}
              color={getColor()}
              messages={[]}
              users={supporters}
              isOnline={isOnline}
              loading={loading}
              goToConversationList={goToConversationList}
            />
          );
        }}
      </AppConsumer>
    );
  }
}

const query = compose(
  graphql<{}, {}>(gql(graphqlTypes.conversationDetailQuery), {
    options: () => ({
      variables: {
        integrationId: connection.data.integrationId
      },
      fetchPolicy: "network-only"
    })
  })
);

export default query(ConversationCreate);

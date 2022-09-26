import gql from "graphql-tag";
import * as React from "react";
import { ChildProps, compose, graphql } from "react-apollo";
import { IBrowserInfo } from "../../types";
import DumbConversationList from "../components/ConversationList";
import { connection } from "../connection";
import graphqlTypes from "../graphql";
import { EngageMessageQueryResponse, IConversation } from "../types";
import { AppConsumer } from "./AppContext";

type QueryResponse = {
  loading: boolean;
  widgetsConversations: IConversation[];
};

type Props = {
  browserInfo?: IBrowserInfo;
  engageMessageQuery: EngageMessageQueryResponse;
  conversationsQuery: QueryResponse;
};

class ConversationList extends React.PureComponent<ChildProps<Props>, QueryResponse> {
  render() {
    const { conversationsQuery, engageMessageQuery } = this.props;


    const message = engageMessageQuery.widgetsGetEngageMessage;

    console.log('message', message);

    let conversations = conversationsQuery.widgetsConversations || [];

    console.log('conversations', conversations);

    // show empty list while waiting
    if (conversationsQuery.loading) {
      conversations = [];
    }

    return (
      <AppConsumer>
        {({ goToConversation, changeRoute }) => {
          const createConversation = () => {
            changeRoute("conversationCreate");
          };
          const goToHome = () => {
            changeRoute("home");
          };

          return (
            <DumbConversationList
              {...this.props}
              loading={conversationsQuery.loading}
              conversations={conversations}
              goToConversation={goToConversation}
              createConversation={createConversation}
              goToHome={goToHome}
            />
          );
        }}
      </AppConsumer>
    );
  }
}

// const ListWithData = graphql<{}, QueryResponse>(
//   gql(graphqTypes.allConversations),
//   {
//     options: () => ({
//       fetchPolicy: "network-only",
//       variables: connection.data
//     })
//   }
// )(ConversationList);

const withPollInterval = compose(
  graphql<Props>(gql(graphqlTypes.getEngageMessage), {
    name: "engageMessageQuery",
    options: ownProps => ({
      variables: {
        integrationId: connection.data.integrationId,
        customerId: connection.data.customerId,
        visitorId: connection.data.visitorId,
        browserInfo: ownProps.browserInfo
      },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "network-only",
      skip: !connection.data.customerId,
      // every minute
      pollInterval: 10000
    })
  }),
  gql(graphqlTypes.allConversations),
  {
    options: () => ({
      fetchPolicy: "network-only",
      variables: connection.data
    })
  }
)(ConversationList);

export default withPollInterval;

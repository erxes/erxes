import gql from "graphql-tag";
import * as React from "react";
import { ChildProps, graphql } from "react-apollo";
import { IUser } from "../../types";
import { Home as WidgetHome } from "../components";
import { connection } from "../connection";
import graphqTypes from "../graphql";
import { AppConsumer } from "./AppContext";

type QueryResponse = {
  messengerSupporters: IUser[];
};

class Home extends React.Component<ChildProps<{}, QueryResponse>, {}> {
  getWelcomeMessage() {
    const { messengerData } = connection.data;

    if (!messengerData.welcomeMessage) {
      return "Welcome! Let us know your questions here, and we'll be happy to help!";
    }

    return messengerData.welcomeMessage;
  }

  render() {
    const { data } = this.props;

    return (
      <AppConsumer>
        {({ changeRoute }) => {
          const createConversation = () => {
            changeRoute("conversationCreate");
          };

          return (
            <WidgetHome
              {...this.props}
              users={data ? data.messengerSupporters || [] : []}
              createConversation={createConversation}
              welcomeMessage={this.getWelcomeMessage()}
            />
          );
        }}
      </AppConsumer>
    );
  }
}

const HomeWithData = graphql<{}, QueryResponse>(
  gql(graphqTypes.messengerSupportersQuery),
  {
    options: () => ({
      variables: {
        integrationId: connection.data.integrationId
      },
      fetchPolicy: "network-only"
    })
  }
)(Home);

export default HomeWithData;

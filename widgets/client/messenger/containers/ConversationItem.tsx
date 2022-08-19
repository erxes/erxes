import gql from "graphql-tag";
import * as React from "react";
import { ChildProps, graphql } from "react-apollo";
import DumbConversationItem from "../components/ConversationItem";
import graphqlTypes from "../graphql";
import { IConversation } from "../types";

type Props = {
  conversation: IConversation;
  goToConversation: (conversationId: string) => void;
};

type Response = {
  widgetsUnreadCount: number;
};

class ConversationItem extends React.PureComponent<
  ChildProps<Props, Response>,
  {}
> {
  componentWillMount() {
    const { data, conversation } = this.props;

    if (!data) {
      return;
    }

    // lister for all conversation changes for this customer
    data.subscribeToMore({
      document: gql(graphqlTypes.conversationMessageInserted),
      variables: { _id: conversation._id },
      updateQuery: () => {
        data.refetch();
      }
    });
  }

  render() {
    const { data } = this.props;

    const extendedProps = {
      ...this.props,
      notificationCount: data ? data.widgetsUnreadCount || 0 : 0
    };

    return <DumbConversationItem {...extendedProps} />;
  }
}

export default graphql<Props, Response>(gql(graphqlTypes.unreadCountQuery), {
  options: props => ({
    variables: { conversationId: props.conversation._id }
  })
})(ConversationItem);

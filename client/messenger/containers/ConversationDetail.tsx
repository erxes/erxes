import gql from "graphql-tag";
import * as React from "react";
import { ChildProps, compose, graphql } from "react-apollo";
import { IUser } from "../../types";
import { Conversation as DumbConversation } from "../components";
import { connection } from "../connection";
import graphqlTypes from "../graphql";
import { IConversation, IMessage } from "../types";
import { AppConsumer } from "./AppContext";

type Props = {
  conversationId: string;
  color?: string;
  goToConversationList: () => void;
  endConversation: (conversationId: string) => void;
};

type QueryResponse = {
  conversationDetail: IConversation;
};

class ConversationDetail extends React.Component<
  ChildProps<Props, QueryResponse>,
  {}
> {
  componentWillMount() {
    const { data, endConversation, conversationId } = this.props;

    if (!data) {
      return;
    }

    // lister for new message
    data.subscribeToMore({
      document: gql(graphqlTypes.conversationMessageInserted),
      variables: { _id: conversationId },
      updateQuery: (prev, { subscriptionData }) => {
        const message = subscriptionData.data.conversationMessageInserted;
        const conversationDetail = prev.conversationDetail || {};
        const messages = conversationDetail.messages || [];

        // check whether or not already inserted
        const prevEntry = messages.find((m: IMessage) => m._id === message._id);

        if (prevEntry) {
          return prev;
        }

        // do not show internal messages
        if (message.internal) {
          return prev;
        }

        // add new message to messages list
        const next = {
          ...prev,
          conversationDetail: {
            ...conversationDetail,
            messages: [...messages, message]
          }
        };

        return next;
      }
    });

    // lister for conversation status change
    data.subscribeToMore({
      document: gql(graphqlTypes.conversationChanged),
      variables: { _id: conversationId },
      updateQuery: (prev, { subscriptionData }) => {
        const data = subscriptionData.data || {};
        const conversationChanged = data.conversationChanged || {};
        const type = conversationChanged.type;

        if (type === "closed") {
          endConversation(conversationId);
        }
      }
    });
  }

  render() {
    const { data } = this.props;

    let messages: IMessage[] = [];
    let isOnline: boolean = false;
    let loading: boolean = true;
    let supporters: IUser[] = [];

    if (data && data.conversationDetail) {
      const conversationDetail = data.conversationDetail;

      messages = conversationDetail.messages;
      loading = data.loading;
      isOnline = conversationDetail.isOnline;
      supporters = conversationDetail.supporters || [];
    }

    return (
      <DumbConversation
        {...this.props}
        messages={messages}
        loading={loading}
        users={supporters}
        isOnline={isOnline}
      />
    );
  }
}

const query = compose(
  graphql<{ conversationId: string }>(
    gql(graphqlTypes.conversationDetailQuery),
    {
      options: ownProps => ({
        variables: {
          _id: ownProps.conversationId,
          integrationId: connection.data.integrationId
        },
        fetchPolicy: "network-only"
      })
    }
  )
);

const WithQuery = query(ConversationDetail);

const WithConsumer = () => {
  return (
    <AppConsumer>
      {({
        activeConversation,
        goToConversationList,
        endConversation,
        getColor
      }) => {
        return (
          <WithQuery
            conversationId={activeConversation}
            goToConversationList={goToConversationList}
            endConversation={endConversation}
            color={getColor()}
          />
        );
      }}
    </AppConsumer>
  );
};

export default WithConsumer;

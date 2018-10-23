import gql from "graphql-tag";
import * as React from "react";
import { ChildProps, compose, graphql } from "react-apollo";
import { IParticipator, IUser } from "../../types";
import { ConversationDetail as DumbComponent } from "../components";
import { connection } from "../connection";
import graphqlTypes from "../graphql";
import { IConversation, IMessage } from "../types";
import { AppConsumer } from "./AppContext";

type Props = {
  conversationId: string;
  color?: string;
  goToConversationList: () => void;
  endConversation: (conversationId: string) => void;
  supporters: IUser[];
  loading?: boolean;
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
        const subData = subscriptionData.data || {};
        const conversationChanged = subData.conversationChanged || {};
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
    let participators: IParticipator[] = [];
    let isOnline: boolean = false;

    if (data && data.conversationDetail) {
      const conversationDetail = data.conversationDetail;
      messages = conversationDetail.messages;
      participators = conversationDetail.participatedUsers || [];
      isOnline = conversationDetail.isOnline;
    }

    return (
      <DumbComponent
        {...this.props}
        messages={messages}
        isOnline={isOnline}
        participators={participators}
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

type PropsWihtConsumer = {
  supporters: IUser[];
  loading?: boolean;
};

const WithConsumer = (props: PropsWihtConsumer) => {
  return (
    <AppConsumer>
      {({
        activeConversation,
        goToConversationList,
        endConversation,
        getColor
      }) => {
        const key = activeConversation || "create";

        return (
          <WithQuery
            {...props}
            key={key}
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

import * as React from 'react';
import * as PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import * as gql from 'graphql-tag';
import { AppConsumer } from './AppContext';
import { connection } from '../connection';
import { Conversation as DumbConversation } from '../components';
import graphqlTypes from '../graphql';

class ConversationDetail extends React.Component {
  componentWillMount() {
    const { conversationDetailQuery, endConversation, conversationId } = this.props;

    // lister for new message
    conversationDetailQuery.subscribeToMore({
      document: gql(graphqlTypes.conversationMessageInserted),
      variables: { _id: conversationId },
      updateQuery: (prev, { subscriptionData }) => {
        const message = subscriptionData.data.conversationMessageInserted;
        const conversationDetail = prev.conversationDetail || {};
        const messages = conversationDetail.messages || [];

        // check whether or not already inserted
        const prevEntry = messages.find(m => m._id === message._id);

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
            messages: [...messages, message],
          },
        };

        return next;
      },
    });

    // lister for conversation status change
    conversationDetailQuery.subscribeToMore({
      document: gql(graphqlTypes.conversationChanged),
      variables: { _id: conversationId },
      updateQuery: (prev, { subscriptionData }) => {
        const data = subscriptionData.data || {};
        const conversationChanged = data.conversationChanged || {};
        const type = conversationChanged.type;

        if (type === 'closed') {
          endConversation(conversationId);
        }
      },
    });
  }

  render() {
    const { conversationDetailQuery } = this.props;

    const conversationDetail = conversationDetailQuery.conversationDetail || {};
    const { messages=[], isOnline=false, supporters=[] } = conversationDetail;

    return (
      <DumbConversation
        {...this.props}
        messages={messages}
        users={supporters}
        isOnline={isOnline}
        data={connection.data}
      />
    );
  }
}

const query = compose(
  graphql(
    gql(graphqlTypes.conversationDetailQuery),
    {
      name: 'conversationDetailQuery',
      options: ownProps => ({
        variables: {
          _id: ownProps.conversationId,
          integrationId: connection.data.integrationId,
        },
        fetchPolicy: 'network-only',
      }),
    },
  ),
);

ConversationDetail.propTypes = {
  conversationId: PropTypes.string,
  conversationDetailQuery: PropTypes.object,
  endConversation: PropTypes.func,
}

const WithQuery = query(ConversationDetail);

const WithConsumer = (props) => {
  return (
    <AppConsumer>
      {({ activeConversation, goToConversationList, endConversation }) => {

        return (
          <WithQuery
            {...props}
            conversationId={activeConversation}
            goToConversationList={goToConversationList}
            endConversation={endConversation}
          />
        );
      }}
    </AppConsumer>
  )
};

export default WithConsumer;

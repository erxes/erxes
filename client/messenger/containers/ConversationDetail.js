import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { AppConsumer } from './AppContext';
import { connection } from '../connection';
import { Conversation as DumbConversation } from '../components';
import graphqlTypes from '../graphql';
import conversationCommonQueries from './conversationCommonQueries';

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
        const next = Object.assign({}, prev, {
          conversationDetail: Object.assign({
            ...conversationDetail,
            messages: [...messages, message],
          }),
        });

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
    const {
      conversationDetailQuery,
      messengerSupportersQuery,
      isMessengerOnlineQuery,
    } = this.props;

    const conversationDetail = conversationDetailQuery.conversationDetail || {};

    return (
      <DumbConversation
        {...this.props}
        messages={conversationDetail.messages || []}
        users={messengerSupportersQuery.messengerSupporters || []}
        isOnline={isMessengerOnlineQuery.isMessengerOnline || false}
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
        },
        fetchPolicy: 'network-only',
      }),
    },
  ),
  ...conversationCommonQueries(),
);

ConversationDetail.propTypes = {
  conversationId: PropTypes.string,
  conversationDetailQuery: PropTypes.object,
  messengerSupportersQuery: PropTypes.object,
  isMessengerOnlineQuery: PropTypes.object,
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

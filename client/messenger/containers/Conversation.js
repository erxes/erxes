import React, { PropTypes } from 'react';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import { connection } from '../connection';
import { changeRoute, changeConversation } from '../actions/messenger';
import { Conversation as DumbConversation } from '../components';
import graphqlTypes from './graphql';

class Conversation extends React.Component {
  componentWillMount() {
    const { data, conversationId } = this.props;

    this.subscribe(data, conversationId);
  }

  componentWillReceiveProps(nextProps) {
    // when new conversation, conversationId props will be null. So after first
    // message creation update subscription with new conversationId variable
    if (this.props.conversationId !== nextProps.conversationId) {
      this.subscribe(this.props.data, nextProps.conversationId);
    }
  }

  subscribe(data, conversationId) {
    // lister for new message
    return data.subscribeToMore({
      document: gql(graphqlTypes.conversationMessageInserted),
      variables: { _id: conversationId },
      updateQuery: (prev, { subscriptionData }) => {
        const message = subscriptionData.data.conversationMessageInserted;

        if (!message) {
          return prev;
        }

        // do not show internal messages
        if (message.internal) {
          return prev;
        }

        const messages = prev.messages;

        // add new message to messages list
        const next = Object.assign({}, prev, {
          messages: [...messages, message],
        });

        return next;
      },
    });
  }

  render() {
    const props = this.props;
    let messages = props.data.messages || [];
    let user = props.data.conversationLastStaff;

    // show empty list while waiting
    if (props.data.loading) {
      messages = [];
      user = null;
    }

    const extendedProps = {
      ...props,
      messages,
      user,
      isOnline: props.data.isMessengerOnline,
      data: connection.data,
    };

    return <DumbConversation {...extendedProps} />;
  }
}


const mapStateToProps = (state) => {
  const isNewConversation = !state.activeConversation;

  return {
    isObtainedEmail: state.isObtainedEmail,
    conversationId: state.activeConversation,
    isNewConversation,
  };
};

const mapDisptachToProps = dispatch => ({
  goToConversationList(e) {
    e.preventDefault();

    // reset current conversation
    dispatch(changeConversation(''));

    dispatch(changeRoute('conversationList'));
  },
});

const query = graphql(
  gql(graphqlTypes.conversationDetailQuery),
  {
    options: ownProps => ({
      variables: {
        conversationId: ownProps.conversationId,
        integrationId: connection.data.integrationId,
      },
    }),
  },
);

Conversation.propTypes = {
  data: PropTypes.object,
  conversationId: PropTypes.string,
}

export default connect(mapStateToProps, mapDisptachToProps)(query(Conversation));

import React from 'react';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import Subscriber from './Subscriber';
import { connection } from '../connection';
import { changeRoute, changeConversation } from '../actions/messenger';
import { Conversation as DumbConversation } from '../components';


const messageQuery = `
  _id
  user {
    _id
    details {
      avatar
      fullName
    }
  }
  content
  createdAt
  attachments{
    url
    name
    size
    type
  }
`;


class Conversation extends Subscriber {
  subscribeOptions(props) {
    return {
      document: gql`
        subscription onMessageInserted($conversationId: String!) {
          messageInserted(conversationId: $conversationId) {
            ${messageQuery}
          }
        }
      `,

      variables: {
        conversationId: props.conversationId,
      },

      // push new message to messages list when subscription updated
      updateQuery: (prev, { subscriptionData }) => {
        // get previous messages list
        const messages = prev.messages || [];

        // add new one
        return Object.assign({}, prev, {
          messages: [...messages, subscriptionData.data.messageInserted],
        });
      },
    };
  }

  componentWillReceiveProps(nextProps) {
    const props = this.props;
    const { subscribeToMore } = props.data;

    // first time subscription creation
    if (!this.subscription && !nextProps.data.loading) {
      this.subscription = [subscribeToMore(this.subscribeOptions(props))];
    }

    // when new conversation, conversationId props will be null. So after first
    // message creation update subscription with new conversationId variable
    if (!props.conversationId && nextProps.conversationId) {
      this.subscription = [subscribeToMore(this.subscribeOptions(nextProps))];
    }
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

  return { conversationId: state.activeConversation, isNewConversation };
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
  gql`
    query ($conversationId: String!, $integrationId: String!) {
      messages(conversationId: $conversationId) {
        ${messageQuery}
      }

      conversationLastStaff(_id: $conversationId) {
        _id,
        details {
          avatar
          fullName
        }
      }

      isMessengerOnline(integrationId: $integrationId)
    }
  `,
  {
    options: ownProps => ({
      fetchPolicy: 'network-only',
      pollInterval: 30000,
      variables: {
        conversationId: ownProps.conversationId,
        integrationId: connection.data.integrationId,
      },
    }),
  },
);

export default connect(mapStateToProps, mapDisptachToProps)(query(Conversation));

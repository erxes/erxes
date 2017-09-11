import React, { PropTypes } from 'react';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
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
  engageData {
    content
    kind
    sentAs
    fromUser {
      details {
        fullName
        avatar
      }
    }
  }
  attachments{
    url
    name
    size
    type
  }
`;

class Conversation extends React.Component {
  componentWillMount() {
    const { conversationId, data } = this.props;

    // lister for new message insert
    data.subscribeToMore({
      document: gql`
        subscription conversationUpdated($conversationId: String!) {
          conversationUpdated(conversationId: $conversationId) {
            type
            message {
              ${messageQuery}
            }
          }
        }`
      ,
      variables: { conversationId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }

        const { type, message } = subscriptionData.data.conversationUpdated;

        // if some changes except newMessage occur, refetch query
        if (type !== 'newMessage') {
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

Conversation.propTypes = {
  data: PropTypes.object,
  conversationId: PropTypes.string,
}

export default connect(mapStateToProps, mapDisptachToProps)(query(Conversation));

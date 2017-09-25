import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose, gql, graphql } from 'react-apollo';
import { connection } from '../connection';
import { changeRoute, changeConversation } from '../actions/messenger';
import { Conversation as DumbConversation } from '../components';
import graphqlTypes from './graphql';

class Conversation extends React.Component {
  componentWillMount() {
    const { conversationDetailQuery, conversationId } = this.props;

    if (conversationId) {
      this.subscribe(conversationDetailQuery, conversationId);
    }
  }

  subscribe(conversationDetailQuery, conversationId) {
    // lister for new message
    return conversationDetailQuery.subscribeToMore({
      document: gql(graphqlTypes.conversationMessageInserted),
      variables: { _id: conversationId },
      updateQuery: (prev, { subscriptionData }) => {
        const message = subscriptionData.data.conversationMessageInserted;
        const conversationDetail = prev.conversationDetail;
        const messages = conversationDetail.messages;

        // TODO: Doing this because of Missing field avatar in {}
        // error. Will learn about this bug later
        if (messages.length <= 1) {
          return conversationDetailQuery.refetch();
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
  }

  render() {
    let {
      conversationDetailQuery,
      conversationLastStaffQuery,
      isMessengerOnlineQuery,
    } = this.props;

    const conversationDetail = conversationDetailQuery.conversationDetail || {};

    const extendedProps = {
      ...this.props,
      messages: conversationDetail.messages || [],
      user: conversationLastStaffQuery.conversationLastStaff || {},
      isOnline: isMessengerOnlineQuery.isMessengerOnline || false,
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

const query = compose(
  graphql(
    gql(graphqlTypes.conversationDetailQuery),
    {
      name: 'conversationDetailQuery',
      options: ownProps => ({
        variables: {
          conversationId: ownProps.conversationId,
        },
        fetchPolicy: 'network-only',
      }),
    },
  ),

  graphql(
    gql(graphqlTypes.conversationLastStaffQuery),
    {
      name: 'conversationLastStaffQuery',
      options: ownProps => ({
        variables: {
          conversationId: ownProps.conversationId,
        },
        fetchPolicy: 'network-only',
      }),
    },
  ),

  graphql(
    gql(graphqlTypes.isMessengerOnlineQuery),
    {
      name: 'isMessengerOnlineQuery',
      options: () => ({
        variables: {
          integrationId: connection.data.integrationId,
        },
        fetchPolicy: 'network-only',
      }),
    },
  )
);

const Container = (props) =>
  <Conversation key={`widget-${props.conversationId || 0}`} {...props} />

Container.propTypes = {
  conversationId: PropTypes.string,
}

Conversation.propTypes = {
  conversationId: PropTypes.string,
  conversationDetailQuery: PropTypes.object,
  conversationLastStaffQuery: PropTypes.object,
  isMessengerOnlineQuery: PropTypes.object,
}

export default connect(mapStateToProps, mapDisptachToProps)(query(Container));

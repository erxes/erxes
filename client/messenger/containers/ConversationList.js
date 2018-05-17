import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { gql, graphql } from 'react-apollo';
import { connection } from '../connection';
import { readMessages } from '../actions/messages';
import { changeRoute, changeConversation } from '../actions/messenger';
import { ConversationList as DumbConversationList } from '../components';

class ConversationList extends React.Component {
  render() {
    const { data } = this.props;

    let conversations = data.conversations || [];

    // show empty list while waiting
    if (data.loading) {
      conversations = [];
    }

    const extendedProps = {
      ...this.props,
      conversations,
    };

    return <DumbConversationList {...extendedProps} />;
  }
}

ConversationList.propTypes = {
  data: PropTypes.object,
};


const mapDisptachToProps = dispatch => ({
  createConversation(e) {
    e.preventDefault();
    dispatch(changeRoute('conversationCreate'));
  },

  goToConversation(conversationId) {
    // change current conversation
    dispatch(changeConversation(conversationId));

    // change route
    dispatch(changeRoute('conversationDetail'));

    // mark as read
    dispatch(readMessages(conversationId));
  },
});

const ListWithData = graphql(
  gql`
    query allConversations(${connection.queryVariables}) {
      conversations(${connection.queryParams}) {
        _id
        content
        createdAt
        participatedUsers {
          details {
            fullName
            avatar
          }
        }
      }
    }
  `,

  {
    options: () => ({
      fetchPolicy: 'network-only',
      variables: connection.data,
    }),
  },
)(ConversationList);

export default connect(() => ({}), mapDisptachToProps)(ListWithData);

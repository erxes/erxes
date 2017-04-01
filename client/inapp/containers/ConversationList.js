import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { connection } from '../connection';
import { readMessages } from '../actions/messages';
import { changeRoute, changeConversation } from '../actions/messenger';
import { ConversationList as DumbConversationList } from '../components';

const ConversationList = (props) => {
  const { data } = props;

  let conversations = props.data.conversations || [];

  // show empty list while waiting
  if (data.loading) {
    conversations = [];
  }

  const extendedProps = {
    ...props,
    conversations,
  };

  return <DumbConversationList {...extendedProps} />;
};

ConversationList.propTypes = {
  data: PropTypes.shape({
    conversations: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      date: PropTypes.instanceOf(Date),
    })),
  }),
};


const mapDisptachToProps = dispatch => ({
  createConversation(e) {
    e.preventDefault();
    dispatch(changeRoute('conversation'));
  },

  goToConversation(conversationId) {
    // change current conversation
    dispatch(changeConversation(conversationId));

    // change route
    dispatch(changeRoute('conversation'));

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

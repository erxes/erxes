import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { connection } from '../../erxes';
import { readMessages } from '../actions/messages';
import { changeRoute, changeConversation } from '../actions/messenger';
import { ConversationList as DumbConversationList } from '../components';

const ConversationList = (props) => {
  const { data } = props;

  if (data.loading) {
    return null;
  }

  const extendedProps = {
    ...props,
    conversations: props.data.conversations,
  };

  return <DumbConversationList { ...extendedProps } />;
};

ConversationList.propTypes = {
  data: PropTypes.object.isRequired,
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
    query allConversations($brandCode: String!, $email: String!) {
      conversations(brandCode: $brandCode, email: $email) {
        _id
        content
      }
    }
  `,

  {
    options: () => ({
      forceFetch: true,
      variables: {
        brandCode: connection.data.brand_id,
        email: connection.data.email,
      },
    }),
  }
)(ConversationList);

export default connect(() => ({}), mapDisptachToProps)(ListWithData);

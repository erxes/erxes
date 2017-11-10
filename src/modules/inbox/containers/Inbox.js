import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Inbox as InboxComponent } from '../components';
import { queries } from '../graphql';

const Inbox = props => {
  const { currentConversationQuery } = props;

  if (currentConversationQuery.loading) {
    return false;
  }

  // =============== actions
  const changeStatus = () => {};

  const currentConversation = currentConversationQuery.conversationsGetCurrent;

  const updatedProps = {
    ...this.props,
    currentConversation,
    changeStatus
  };

  return <InboxComponent {...updatedProps} />;
};

Inbox.propTypes = {
  currentConversationQuery: PropTypes.object
};

export default compose(
  graphql(gql(queries.currentConversation), {
    name: 'currentConversationQuery',
    options: ({ queryParams }) => {
      return {
        variables: { _id: queryParams._id }
      };
    }
  })
)(Inbox);

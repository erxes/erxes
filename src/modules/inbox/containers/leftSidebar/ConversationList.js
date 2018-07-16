import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { router as routerUtils } from 'modules/common/utils';
import { ConversationList } from 'modules/inbox/components/leftSidebar';
import { queries } from 'modules/inbox/graphql';
import { generateParams } from 'modules/inbox/utils';

class ConversationListContainer extends Component {
  render() {
    const { history, conversationsQuery } = this.props;

    const conversations = conversationsQuery.conversations || [];

    // on change conversation
    const onChangeConversation = conversation => {
      routerUtils.setParams(history, { _id: conversation._id });
    };

    const updatedProps = {
      ...this.props,
      conversations,
      onChangeConversation,
      refetch: conversationsQuery.refetch,
      loading: conversationsQuery.loading
    };

    return <ConversationList {...updatedProps} />;
  }
}

ConversationListContainer.propTypes = {
  conversationsQuery: PropTypes.object,
  history: PropTypes.object
};

export default compose(
  graphql(gql(queries.sidebarConversations), {
    name: 'conversationsQuery',
    options: ({ queryParams }) => ({
      variables: generateParams(queryParams),
      pollInterval: 3000
    })
  })
)(ConversationListContainer);

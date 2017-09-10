import React, { PropTypes } from 'react';
import { compose, gql, graphql } from 'react-apollo';
import { Bulk, pagination } from '/imports/react-ui/common';
import { DetailSidebar } from '../components';
import { queries } from '../graphql';

class DetailSidebarContainer extends Bulk {
  render() {
    const {
      channelId,
      conversation,
      totalCountQuery,
      conversationsQuery,
      queryParams,
    } = this.props;

    if (conversationsQuery.loading || totalCountQuery.loading) {
      return null;
    }

    const user = Meteor.user();
    const conversations = conversationsQuery.conversations;
    const totalCount = totalCountQuery.totalConversationsCount;

    const { loadMore, hasMore } = pagination(queryParams, totalCount);

    // const conversationSort = { sort: { createdAt: -1 } };

    // unread conversations
    const unreadConversations = conversations.filter(conv => !conv.readUserIds.includes(user._id));

    // read conversations
    const readConversations = conversations.filter(
      conv => conv.readUserIds.includes(user._id) && conv._id !== conversation._id,
    );

    const updatedProps = {
      ...this.props,
      bulk: this.state.bulk,
      loadMore,
      hasMore,
      unreadConversations,
      readConversations,
      channelId,
      user,
      toggleBulk: this.toggleBulk,
      emptyBulk: this.emptyBulk,
    };

    return <DetailSidebar {...updatedProps} />;
  }
}

DetailSidebarContainer.propTypes = {
  conversation: PropTypes.object,
  queryParams: PropTypes.object,
  channelId: PropTypes.string,
  conversationsQuery: PropTypes.object,
  totalCountQuery: PropTypes.object,
};

export default compose(
  graphql(gql(queries.conversationList), {
    name: 'conversationsQuery',
    options: ({ queryParams }) => ({
      fetchPolicy: 'network-only',
      variables: {
        params: queryParams,
      },
    }),
  }),
  graphql(
    gql`
      query totalConversationsCount {
        totalConversationsCount
      }
    `,
    {
      name: 'totalCountQuery',
      options: () => ({
        fetchPolicy: 'network-only',
      }),
    },
  ),
)(DetailSidebarContainer);

import { Meteor } from 'meteor/meteor';
import React, { PropTypes } from 'react';
import { compose, gql, graphql } from 'react-apollo';
import { Bulk, pagination } from '/imports/react-ui/common';
import { List } from '../components';
import { queries, subscriptions } from '../graphql';

class ListContainer extends Bulk {
  componentWillMount() {
    this.props.conversationsQuery.subscribeToMore({
      document: gql(subscriptions.conversationNotification),
      updateQuery: () => {
        this.props.conversationsQuery.refetch();
      },
    });
  }

  refetch() {
    this.props.conversationsQuery.refetch();
  }

  render() {
    const { queryParams, channelId, conversationsQuery, totalCountQuery } = this.props;

    const conversations = conversationsQuery.conversations || [];
    const totalCount = totalCountQuery.totalConversationsCount;

    const { loadMore, hasMore } = pagination(queryParams, totalCount);

    // subscriptions ==================
    const user = Meteor.user();
    const starredConversationIds = user.details.starredConversationIds || [];

    // const conversationSort = { sort: { createdAt: -1 } };

    // unread conversations
    const unreadConversations = conversations.filter(
      conv => !(conv.readUserIds || []).includes(user._id),
    );

    // read conversations
    const readConversations = conversations.filter(conv =>
      (conv.readUserIds || []).includes(user._id),
    );

    const updatedProps = {
      ...this.props,
      bulk: this.state.bulk,
      toggleBulk: this.toggleBulk,
      emptyBulk: this.emptyBulk,
      loadMore,
      hasMore,
      unreadConversations,
      readConversations,
      starredConversationIds,
      channelId,
      user,
      conversationReady: conversationsQuery.loading && totalCountQuery.loading,
      refetch: this.refetch,
    };

    return <List {...updatedProps} />;
  }
}

ListContainer.propTypes = {
  channelId: PropTypes.string,
  queryParams: PropTypes.object,
  conversationsQuery: PropTypes.object,
  totalCountQuery: PropTypes.object,
};

export default compose(
  graphql(gql(queries.conversationList), {
    name: 'conversationsQuery',
    options: ({ queryParams }) => {
      return {
        variables: {
          params: {
            ...queryParams,
            limit: queryParams.limit || 20,
          },
        },
        fetchPolicy: 'network-only',
      };
    },
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
)(ListContainer);

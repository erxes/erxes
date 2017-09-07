import React, { PropTypes } from 'react';
import { compose, gql, graphql } from 'react-apollo';
import { ReactiveVar } from 'meteor/reactive-var';
import { _ } from 'meteor/underscore';
import { pagination } from '/imports/react-ui/common';
import { DetailSidebar } from '../components';

const bulk = new ReactiveVar([]);

const DetailSidebarContainer = props => {
  const { channelId, conversation, totalCountQuery, conversationsQuery, queryParams } = props;

  if (conversationsQuery.loading || totalCountQuery.loading) {
    return null;
  }

  const user = Meteor.user();
  const conversations = conversationsQuery.conversations;
  const totalCount = totalCountQuery.totalConversationsCount;

  const { loadMore, hasMore } = pagination(queryParams, totalCount);

  // actions ===========
  const toggleBulk = (conversation, toAdd) => {
    let entries = bulk.get();

    // remove old entry
    entries = _.without(entries, _.findWhere(entries, { _id: conversation._id }));

    if (toAdd) {
      entries.push(conversation);
    }

    bulk.set(entries);
  };

  const emptyBulk = () => {
    bulk.set([]);
  };

  // const conversationSort = { sort: { createdAt: -1 } };

  // unread conversations
  const unreadConversations = conversations.filter(conv => !conv.readUserIds.includes(user._id));

  // read conversations
  const readConversations = conversations.filter(
    conv => conv.readUserIds.includes(user._id) && conv._id !== conversation._id,
  );

  const updatedProps = {
    ...props,
    bulk: bulk.get(),
    loadMore,
    hasMore,
    unreadConversations,
    readConversations,
    channelId,
    user,
    toggleBulk,
    emptyBulk,
  };

  return <DetailSidebar {...updatedProps} />;
};

DetailSidebarContainer.propTypes = {
  conversation: PropTypes.object,
  queryParams: PropTypes.object,
  channelId: PropTypes.string,
  conversationsQuery: PropTypes.object,
  totalCountQuery: PropTypes.object,
};

export default compose(
  graphql(
    gql`
      query conversations($params: ConversationListParams) {
        conversations(params: $params) {
          _id
          readUserIds
          content
          createdAt
          customer {
            _id
            name
          }
          integration {
            _id
            brand {
              _id
              name
            }
          }
          tags {
            _id
            name
            color
          }
        }
      }
    `,
    {
      name: 'conversationsQuery',
      options: ({ queryParams }) => ({
        fetchPolicy: 'network-only',
        variables: {
          params: queryParams,
        },
      }),
    },
  ),
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

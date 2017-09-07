import { Meteor } from 'meteor/meteor';
import React, { PropTypes } from 'react';
import { compose, gql, graphql } from 'react-apollo';
import { ReactiveVar } from 'meteor/reactive-var';
import { pagination } from '/imports/react-ui/common';
import { toggleBulk as commonToggleBulk } from '/imports/react-ui/common/utils';
import { List } from '../components';

const bulk = new ReactiveVar([]);

const ListContainer = props => {
  const { queryParams, channelId, conversationsQuery, totalCountQuery } = props;

  if (conversationsQuery.loading || totalCountQuery.loading) {
    return null;
  }

  const conversations = conversationsQuery.conversations;
  const totalCount = totalCountQuery.totalConversationsCount;

  const { loadMore, hasMore } = pagination(queryParams, totalCount);

  // actions ===========
  const toggleBulk = (conv, toAdd) => commonToggleBulk(bulk, conv, toAdd);
  const emptyBulk = () => bulk.set([]);

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
    ...props,
    bulk: bulk.get(),
    loadMore,
    hasMore,
    toggleBulk,
    emptyBulk,
    unreadConversations,
    readConversations,
    starredConversationIds,
    channelId,
    user,
  };

  return <List {...updatedProps} />;
};

ListContainer.propTypes = {
  channelId: PropTypes.string,
  queryParams: PropTypes.object,
  conversationsQuery: PropTypes.object,
  totalCountQuery: PropTypes.object,
};

export default compose(
  graphql(
    gql`
      query objects($limit: Int!) {
        conversations(limit: $limit) {
          _id
          content
          createdAt
          participatorCount
          readUserIds
          participatedUserIds
          tags {
            _id
            name
          }
          customer {
            _id
            name
          }
          integration {
            _id
            name
            kind

            brand {
              _id
              name
            }
          }
        }
      }
    `,
    {
      name: 'conversationsQuery',
      options: ({ queryParams }) => {
        return {
          variables: {
            limit: queryParams.limit || 20,
          },
        };
      },
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
    },
  ),
)(ListContainer);

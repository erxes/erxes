import React, { PropTypes } from 'react';
import { compose, gql, graphql } from 'react-apollo';
import { ReactiveVar } from 'meteor/reactive-var';
import { TAG_TYPES } from '/imports/api/tags/constants';
import { toggleBulk as commonToggleBulk } from '/imports/react-ui/common/utils';
import { MessageList } from '../components';

const bulk = new ReactiveVar([]);

const MessageListContainer = props => {
  const { queryParams, tagsQuery, engageMessagesQuery } = props;

  if (tagsQuery.loading || engageMessagesQuery.loading) {
    return null;
  }

  // actions ===========
  const toggleBulk = (message, toAdd) => commonToggleBulk(bulk, message, toAdd);
  const emptyBulk = () => bulk.set([]);

  const updatedProps = {
    kind: queryParams.kind,
    messages: engageMessagesQuery.engageMessages,
    tags: tagsQuery.tags,
    bulk: bulk.get(),
    toggleBulk,
    emptyBulk,
    refetch: engageMessagesQuery.refetch,
  };

  return <MessageList {...updatedProps} />;
};

MessageListContainer.propTypes = {
  type: PropTypes.string,
  queryParams: PropTypes.object,
  engageMessagesQuery: PropTypes.object,
  tagsQuery: PropTypes.object,
};

export default compose(
  graphql(
    gql`
      query engageMessages($kind: String, $status: String, $tag: String) {
        engageMessages(kind: $kind, status: $status, tag: $tag) {
          _id
          title
          deliveryReports
          isDraft
          isLive
          createdDate
          segment {
            name
          }
          fromUser {
            details
          }
        }
      }
    `,
    {
      name: 'engageMessagesQuery',
      options: ({ queryParams }) => ({
        fetchPolicy: 'network-only',
        variables: {
          kind: queryParams.kind,
          status: queryParams.status,
          tag: queryParams.tag,
        },
      }),
    },
  ),
  graphql(
    gql`
      query tags($type: String) {
        tags(type: $type) {
          _id
          name
          type
          color
        }
      }
    `,
    {
      name: 'tagsQuery',
      options: () => ({
        variables: {
          type: TAG_TYPES.ENGAGE_MESSAGE,
        },
      }),
    },
  ),
)(MessageListContainer);

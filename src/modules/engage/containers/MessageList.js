import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { TAG_TYPES } from 'modules/tags/constants';
import { Bulk, Spinner } from 'modules/common/components';
import { MessageList } from '../components';
import { queries } from '../graphql';

class MessageListContainer extends Bulk {
  render() {
    const {
      queryParams,
      tagsQuery,
      engageMessagesQuery,
      engageMessagesTotalCountQuery
    } = this.props;

    if (engageMessagesQuery.loading || engageMessagesTotalCountQuery.loading) {
      return <Spinner />;
    }

    const updatedProps = {
      kind: queryParams.kind,
      messages: engageMessagesQuery.engageMessages || [],
      totalCount: engageMessagesTotalCountQuery.engageMessagesTotalCount,
      tags: tagsQuery.tags || [],
      bulk: this.state.bulk,
      toggleBulk: this.toggleBulk,
      emptyBulk: this.emptyBulk,
      refetch: engageMessagesQuery.refetch
    };

    return <MessageList {...updatedProps} />;
  }
}

MessageListContainer.propTypes = {
  type: PropTypes.string,
  queryParams: PropTypes.object,
  engageMessagesQuery: PropTypes.object,
  engageMessagesTotalCountQuery: PropTypes.object,
  tagsQuery: PropTypes.object
};

export default compose(
  graphql(gql(queries.engageMessages), {
    name: 'engageMessagesQuery',
    options: ({ queryParams }) => ({
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'network-only',
      variables: {
        kind: queryParams.kind,
        status: queryParams.status,
        tag: queryParams.tag,
        ids: queryParams.ids
      }
    })
  }),
  graphql(gql(queries.engageMessagesTotalCount), {
    name: 'engageMessagesTotalCountQuery',
    options: () => ({
      notifyOnNetworkStatusChange: true
    })
  }),
  graphql(gql(queries.tags), {
    name: 'tagsQuery',
    options: () => ({
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'network-only',
      variables: {
        type: TAG_TYPES.ENGAGE_MESSAGE
      }
    })
  })
)(MessageListContainer);

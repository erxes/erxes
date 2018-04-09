import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { withRouter } from 'react-router';
import queryString from 'query-string';
import { TAG_TYPES } from 'modules/tags/constants';
import { Bulk } from 'modules/common/components';
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

    const updatedProps = {
      kind: queryParams.kind,
      messages: engageMessagesQuery.engageMessages || [],
      totalCount: engageMessagesTotalCountQuery.engageMessagesTotalCount || 0,
      tags: tagsQuery.tags || [],
      bulk: this.state.bulk,
      toggleBulk: this.toggleBulk,
      emptyBulk: this.emptyBulk,
      queryParams: queryParams,
      refetch: engageMessagesQuery.refetch,
      loading: engageMessagesQuery.loading
    };

    return <MessageList {...updatedProps} />;
  }
}

MessageListContainer.propTypes = {
  type: PropTypes.string,
  queryParams: PropTypes.object,
  engageMessagesQuery: PropTypes.object,
  engageMessagesTotalCountQuery: PropTypes.object,
  tagsQuery: PropTypes.object,
  loading: PropTypes.bool
};

const MessageListContainerWithData = compose(
  graphql(gql(queries.engageMessages), {
    name: 'engageMessagesQuery',
    options: ({ queryParams }) => ({
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'network-only',
      variables: {
        page: queryParams.page,
        perPage: queryParams.perPage || 20,
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

const EngageListContainer = props => {
  const queryParams = queryString.parse(props.location.search);

  const extendedProps = { ...props, queryParams };

  return <MessageListContainerWithData {...extendedProps} />;
};

EngageListContainer.propTypes = {
  location: PropTypes.object,
  history: PropTypes.object
};

export default withRouter(EngageListContainer);

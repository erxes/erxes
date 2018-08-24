import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { withRouter } from 'react-router';
import queryString from 'query-string';
import { Bulk } from 'modules/common/components';
import { MessageList } from '../components';
import { queries } from '../graphql';
import { generateListQueryVariables } from '../utils';

class MessageListContainer extends Bulk {
  render() {
    const {
      queryParams,
      engageMessagesQuery,
      engageMessagesTotalCountQuery
    } = this.props;

    const updatedProps = {
      kind: queryParams.kind,
      messages: engageMessagesQuery.engageMessages || [],
      totalCount: engageMessagesTotalCountQuery.engageMessagesTotalCount || 0,
      bulk: this.state.bulk,
      isAllSelected: this.state.isAllSelected,
      toggleBulk: this.toggleBulk,
      toggleAll: this.toggleAll,
      emptyBulk: this.emptyBulk,
      queryParams: queryParams,
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
  loading: PropTypes.bool
};

const MessageListContainerWithData = compose(
  graphql(gql(queries.engageMessages), {
    name: 'engageMessagesQuery',
    options: props => ({
      variables: generateListQueryVariables(props),
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.engageMessagesTotalCount), {
    name: 'engageMessagesTotalCountQuery',
    options: props => ({
      variables: generateListQueryVariables(props),
      fetchPolicy: 'network-only'
    })
  })
)(MessageListContainer);

const EngageListContainer = props => {
  const queryParams = queryString.parse(props.location.search);

  const extendedProps = { ...props, queryParams };

  return <MessageListContainerWithData {...extendedProps} />;
};

EngageListContainer.propTypes = {
  location: PropTypes.object
};

export default withRouter(EngageListContainer);

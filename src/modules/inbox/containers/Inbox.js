import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import queryString from 'query-string';
import gql from 'graphql-tag';
import { router as routerUtils } from 'modules/common/utils';
import { Inbox, Empty } from '../components';
import { queries } from '../graphql';
import { generateParams } from '../utils';

class WithCurrentId extends React.Component {
  componentWillReceiveProps(nextProps) {
    const { lastConversationQuery, history, queryParams: { _id } } = nextProps;

    let lastConversation = {};

    if (lastConversationQuery) {
      lastConversation = lastConversationQuery.conversationsGetLast;
    }

    if (!_id && lastConversation) {
      routerUtils.setParams(history, { _id: lastConversation._id });
    }
  }

  render() {
    const { queryParams: { _id } } = this.props;

    if (!_id) {
      return <Empty {...this.props} />;
    }

    const updatedProps = {
      ...this.props,
      currentConversationId: _id
    };

    return <Inbox {...updatedProps} />;
  }
}

WithCurrentId.propTypes = {
  lastConversationQuery: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  queryParams: PropTypes.object
};

const WithLastConversation = compose(
  graphql(gql(queries.lastConversation), {
    name: 'lastConversationQuery',
    options: ({ queryParams }) => ({
      skip: queryParams._id,
      variables: generateParams(queryParams),
      fetchPolicy: 'network-only'
    })
  })
)(WithCurrentId);

const WithQueryParams = props => {
  const { location } = props;
  const queryParams = queryString.parse(location.search);

  const extendedProps = { ...props, queryParams };

  return <WithLastConversation {...extendedProps} />;
};

WithQueryParams.propTypes = {
  location: PropTypes.object
};

export default withRouter(WithQueryParams);

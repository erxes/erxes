import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import queryString from 'query-string';
import gql from 'graphql-tag';
import { KIND_CHOICES as INTEGRATIONS_TYPES } from 'modules/settings/integrations/constants';
import { LeftSidebar as LeftSidebarComponent } from '../components';
import { queries } from '../graphql';

class LeftSidebar extends Component {
  render() {
    const { totalCountQuery } = this.props;

    const integrations = INTEGRATIONS_TYPES.ALL_LIST.map(item => ({
      _id: item,
      name: item
    }));

    const totalCount = totalCountQuery.conversationsTotalCount || 0;

    const updatedProps = {
      ...this.props,
      integrations,
      totalCount
    };

    return <LeftSidebarComponent {...updatedProps} />;
  }
}

LeftSidebar.propTypes = {
  totalCountQuery: PropTypes.object
};

const generateOptions = queryParams => ({
  ...queryParams,
  limit: queryParams.limit || 10
});

const WithData = compose(
  graphql(gql(queries.totalConversationsCount), {
    name: 'totalCountQuery',
    options: ({ queryParams }) => ({
      notifyOnNetworkStatusChange: true,
      variables: generateOptions(queryParams)
    })
  })
)(LeftSidebar);

const WithQueryParams = props => {
  const { location } = props;
  const queryParams = queryString.parse(location.search);

  const extendedProps = { ...props, queryParams };

  return <WithData {...extendedProps} />;
};

WithQueryParams.propTypes = {
  location: PropTypes.object
};

export default withRouter(WithQueryParams);

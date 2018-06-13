import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import gql from 'graphql-tag';
import { KIND_CHOICES as INTEGRATIONS_TYPES } from 'modules/settings/integrations/constants';
import { Sidebar as DumbSidebar } from 'modules/inbox/components/leftSidebar';
import { queries } from 'modules/inbox/graphql';

class Sidebar extends Component {
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

    return <DumbSidebar {...updatedProps} />;
  }
}

Sidebar.propTypes = {
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
)(Sidebar);

export default withRouter(WithData);

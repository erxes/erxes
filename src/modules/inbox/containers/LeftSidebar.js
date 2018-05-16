import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { KIND_CHOICES as INTEGRATIONS_TYPES } from 'modules/settings/integrations/constants';
import { router as routerUtils } from 'modules/common/utils';
import { LeftSidebar as LeftSidebarComponent } from '../components';
import { queries } from '../graphql';
import { generateParams } from '../utils';

class LeftSidebar extends Component {
  render() {
    const { history, conversationsQuery, totalCountQuery } = this.props;

    const integrations = INTEGRATIONS_TYPES.ALL_LIST.map(item => ({
      _id: item,
      name: item
    }));

    const conversations = conversationsQuery.conversations || [];

    const totalCount = totalCountQuery.conversationsTotalCount || 0;

    // on change conversation
    const onChangeConversation = conversation => {
      routerUtils.setParams(history, { _id: conversation._id });
    };

    const updatedProps = {
      ...this.props,
      conversations,
      integrations,
      totalCount,
      onChangeConversation,
      refetch: conversationsQuery.refetch,
      loading: conversationsQuery.loading
    };

    return <LeftSidebarComponent {...updatedProps} />;
  }
}

LeftSidebar.propTypes = {
  conversationsQuery: PropTypes.object,
  totalCountQuery: PropTypes.object,
  history: PropTypes.object
};

const generateOptions = queryParams => ({
  ...queryParams,
  limit: queryParams.limit || 10
});

export default compose(
  graphql(gql(queries.sidebarConversations), {
    name: 'conversationsQuery',
    options: ({ queryParams }) => ({
      variables: generateParams(queryParams),
      pollInterval: 3000
    })
  }),
  graphql(gql(queries.totalConversationsCount), {
    name: 'totalCountQuery',
    options: ({ queryParams }) => ({
      notifyOnNetworkStatusChange: true,
      variables: generateOptions(queryParams)
    })
  })
)(LeftSidebar);

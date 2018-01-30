import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { TAG_TYPES } from 'modules/tags/constants';
import { KIND_CHOICES as INTEGRATIONS_TYPES } from 'modules/settings/integrations/constants';
import { LeftSidebar as LeftSidebarComponent } from '../components';
import { queries, subscriptions } from '../graphql';
import { generateParams } from '../utils';

class LeftSidebar extends Component {
  componentWillMount() {
    this.props.conversationsQuery.subscribeToMore({
      // listen for all conversation changes
      document: gql(subscriptions.conversationsChanged),

      updateQuery: () => {
        this.props.conversationsQuery.refetch();
      }
    });
  }

  render() {
    const {
      conversationsQuery,
      channelsQuery,
      brandsQuery,
      tagsQuery,
      conversationCountsQuery,
      totalCountQuery
    } = this.props;

    const integrations = INTEGRATIONS_TYPES.ALL_LIST.map(item => ({
      _id: item,
      name: item
    }));

    const conversations = conversationsQuery.conversations || [];
    const channels = channelsQuery.channels || [];
    const brands = brandsQuery.brands || [];
    const tags = tagsQuery.tags || [];

    const defaultCounts = {
      all: 0,
      byChannels: {},
      byBrands: {},
      byIntegrationTypes: {},
      byTags: {}
    };

    const counts = conversationCountsQuery.conversationCounts || defaultCounts;
    const totalCount = totalCountQuery.conversationsTotalCount || 0;

    const updatedProps = {
      ...this.props,
      conversations,
      channels,
      integrations,
      brands,
      tags,
      counts,
      totalCount,
      refetch: conversationsQuery.refetch,
      loading: conversationsQuery.loading
    };

    return <LeftSidebarComponent {...updatedProps} />;
  }
}

LeftSidebar.propTypes = {
  conversationsQuery: PropTypes.object,
  channelsQuery: PropTypes.object,
  brandsQuery: PropTypes.object,
  tagsQuery: PropTypes.object,
  totalCountQuery: PropTypes.object,
  conversationCountsQuery: PropTypes.object
};

const generateOptions = queryParams => ({
  ...queryParams,
  limit: queryParams.limit || 20
});

export default compose(
  graphql(gql(queries.conversationList), {
    name: 'conversationsQuery',
    options: ({ queryParams }) => ({
      notifyOnNetworkStatusChange: true,
      variables: generateParams(queryParams)
    })
  }),
  graphql(gql(queries.channelList), {
    name: 'channelsQuery'
  }),
  graphql(gql(queries.brandList), {
    name: 'brandsQuery'
  }),
  graphql(gql(queries.tagList), {
    name: 'tagsQuery',
    options: () => ({
      variables: {
        type: TAG_TYPES.CONVERSATION
      }
    })
  }),
  graphql(gql(queries.totalConversationsCount), {
    name: 'totalCountQuery',
    options: ({ queryParams }) => ({
      notifyOnNetworkStatusChange: true,
      variables: generateOptions(queryParams)
    })
  }),
  graphql(gql(queries.conversationCounts), {
    name: 'conversationCountsQuery',
    options: ({ queryParams }) => ({
      notifyOnNetworkStatusChange: true,
      variables: generateParams(queryParams)
    })
  })
)(LeftSidebar);

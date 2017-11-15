import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Sidebar } from 'modules/layout/components';
import { Spinner } from 'modules/common/components';
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
      conversationCountsQuery
    } = this.props;

    if (
      conversationsQuery.loading ||
      channelsQuery.loading ||
      brandsQuery.loading ||
      tagsQuery.loading ||
      conversationCountsQuery.loading
    ) {
      return (
        <Sidebar wide full>
          <Spinner />
        </Sidebar>
      );
    }

    const integrations = INTEGRATIONS_TYPES.ALL_LIST.map(item => ({
      _id: item,
      name: item
    }));

    const conversations = conversationsQuery.conversations;
    const channels = channelsQuery.channels || [];
    const brands = brandsQuery.brands || [];
    const tags = tagsQuery.tags || [];
    const counts = conversationCountsQuery.conversationCounts || {};

    const updatedProps = {
      ...this.props,
      conversations,
      channels,
      integrations,
      brands,
      tags,
      counts
    };

    return <LeftSidebarComponent {...updatedProps} />;
  }
}

LeftSidebar.propTypes = {
  conversationsQuery: PropTypes.object,
  channelsQuery: PropTypes.object,
  brandsQuery: PropTypes.object,
  tagsQuery: PropTypes.object,
  conversationCountsQuery: PropTypes.object
};

export default compose(
  graphql(gql(queries.conversationList), {
    name: 'conversationsQuery',
    options: ({ queryParams }) => ({
      variables: generateParams(queryParams)
    })
  }),
  graphql(gql(queries.channelList), {
    name: 'channelsQuery'
  }),
  graphql(gql(queries.brandList), {
    name: 'brandsQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.tagList), {
    name: 'tagsQuery',
    options: () => {
      return {
        variables: {
          type: TAG_TYPES.CONVERSATION
        },
        fetchPolicy: 'network-only'
      };
    }
  }),
  graphql(gql(queries.conversationCounts), {
    name: 'conversationCountsQuery',
    options: ({ queryParams }) => ({
      variables: generateParams(queryParams)
    })
  })
)(LeftSidebar);

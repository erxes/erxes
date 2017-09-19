import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import React, { PropTypes } from 'react';
import { compose, gql, graphql } from 'react-apollo';
import { TAG_TYPES } from '/imports/api/tags/constants';
import { Sidebar } from '../components';
import { queries, subscriptions } from '../graphql';

class SidebarContainer extends React.Component {
  componentWillMount() {
    this.props.conversationCountsQuery.subscribeToMore({
      document: gql(subscriptions.conversationNotification),
      updateQuery: () => {
        this.props.conversationCountsQuery.refetch();
      },
    });
  }

  render() {
    const { conversationCountsQuery, channelsQuery, tagsQuery, brandsQuery } = this.props;

    const defaultCounts = { byIntegrationTypes: {}, byTags: {}, byChannels: {}, byBrands: {} };

    // show only available channels's related brands
    const channels = channelsQuery.channels || [];
    const brands = brandsQuery.brands || [];
    const tags = tagsQuery.tags || [];
    const counts = conversationCountsQuery.conversationCounts || defaultCounts;

    const updatedProps = {
      ...this.props,
      tags,
      channels,
      brands,
      channelsReady: !channelsQuery.loading,
      tagsReady: !tagsQuery.loading,
      brandsReady: !brandsQuery.loading,
      counts,
    };

    return <Sidebar {...updatedProps} />;
  }
}

SidebarContainer.propTypes = {
  channelsQuery: PropTypes.object,
  tagsQuery: PropTypes.object,
  brandsQuery: PropTypes.object,
  conversationCountsQuery: PropTypes.object,
};

export default compose(
  graphql(gql(queries.channelList), {
    name: 'channelsQuery',
    options: () => {
      const userId = Meteor.userId();

      return {
        variables: {
          memberIds: [userId],
        },
        fetchPolicy: 'network-only',
      };
    },
  }),
  graphql(gql(queries.brandList), {
    name: 'brandsQuery',
    options: () => ({
      fetchPolicy: 'network-only',
    }),
  }),
  graphql(gql(queries.tagList), {
    name: 'tagsQuery',
    options: () => {
      return {
        variables: {
          type: TAG_TYPES.CONVERSATION,
        },
        fetchPolicy: 'network-only',
      };
    },
  }),
  graphql(gql(queries.conversationCounts), {
    name: 'conversationCountsQuery',
    options: () => {
      return {
        variables: {
          params: FlowRouter.current().queryParams,
        },
        fetchPolicy: 'network-only',
      };
    },
  }),
)(SidebarContainer);

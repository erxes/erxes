import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import React, { PropTypes } from 'react';
import { compose, gql, graphql } from 'react-apollo';
import { TAG_TYPES } from '/imports/api/tags/constants';
import { Sidebar } from '../components';

const SidebarContainer = props => {
  const { conversationCountsQuery, channelsQuery, tagsQuery, brandsQuery } = props;

  const defaultCounts = { byIntegrationTypes: {}, byTags: {}, byChannels: {}, byBrands: {} };
  // show only available channels's related brands
  const channels = channelsQuery.channels || [];
  const brands = brandsQuery.brands || [];
  const tags = tagsQuery.tags || [];
  const counts = conversationCountsQuery.conversationCounts || defaultCounts;

  const updatedProps = {
    ...props,
    tags,
    channels,
    brands,
    channelsReady: !channelsQuery.loading,
    tagsReady: !tagsQuery.loading,
    brandsReady: !brandsQuery.loading,
    counts,
  };
  return <Sidebar {...updatedProps} />;
};

SidebarContainer.propTypes = {
  channelsQuery: PropTypes.object,
  tagsQuery: PropTypes.object,
  brandsQuery: PropTypes.object,
  conversationCountsQuery: PropTypes.object,
};

export default compose(
  graphql(
    gql`
      query channels($memberIds: [String]) {
        channels(memberIds: $memberIds) {
          _id
          name
        }
      }
    `,
    {
      name: 'channelsQuery',
      options: () => {
        const userId = Meteor.userId();

        return {
          variables: {
            memberIds: [userId],
          },
        };
      },
    },
  ),
  graphql(
    gql`
      query brands {
        brands {
          _id
          name
        }
      }
    `,
    { name: 'brandsQuery' },
  ),
  graphql(
    gql`
      query tags($type: String) {
        tags(type: $type) {
          _id
          name
          colorCode
        }
      }
    `,
    {
      name: 'tagsQuery',
      options: () => {
        return {
          variables: {
            type: TAG_TYPES.CONVERSATION,
          },
        };
      },
    },
  ),
  graphql(
    gql`
      query conversationCounts($params: ConversationListParams) {
        conversationCounts(params: $params)
      }
    `,
    {
      name: 'conversationCountsQuery',
      options: () => {
        return {
          variables: {
            params: FlowRouter.current().queryParams,
          },
        };
      },
    },
  ),
)(SidebarContainer);

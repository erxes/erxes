import { Meteor } from 'meteor/meteor';
import React, { PropTypes } from 'react';
import { compose, gql, graphql } from 'react-apollo';
import { TAG_TYPES } from '/imports/api/tags/constants';
import { Sidebar } from '../components';

const SidebarContainer = props => {
  const { channelsQuery, tagsQuery, brandsQuery } = props;

  if (channelsQuery.loading || tagsQuery.loading || brandsQuery.loading) {
    return null;
  }

  // show only available channels's related brands
  const channels = channelsQuery.channels;
  const brands = brandsQuery.brands;
  const tags = tagsQuery.tags;

  const updatedProps = {
    ...props,
    tags,
    channels,
    brands,
  };

  return <Sidebar {...updatedProps} />;
};

SidebarContainer.propTypes = {
  channelsQuery: PropTypes.object,
  tagsQuery: PropTypes.object,
  brandsQuery: PropTypes.object,
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
)(SidebarContainer);

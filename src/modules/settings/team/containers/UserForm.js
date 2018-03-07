import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { UserForm } from '../components';
import { Spinner } from 'modules/common/components';
import { queries as groupQueries } from 'modules/settings/usersGroups/graphql';

const UserFormContainer = props => {
  const { object = {}, channelsQuery, groupsQuery } = props;

  if (channelsQuery.loading || groupsQuery.loading) {
    return <Spinner objective />;
  }

  const channels = channelsQuery.channels;

  let selectedChannels = [];

  if (object._id) {
    selectedChannels = channels.filter(c => c.memberIds.includes(object._id));
  }

  const updatedProps = {
    ...props,
    selectedChannels,
    channels,
    groups: groupsQuery.usersGroups
  };

  return <UserForm {...updatedProps} />;
};

UserFormContainer.propTypes = {
  object: PropTypes.object,
  channelsQuery: PropTypes.object,
  groupsQuery: PropTypes.object
};

export default compose(
  graphql(
    gql`
      query channels {
        channels {
          _id
          name
          memberIds
        }
      }
    `,
    {
      name: 'channelsQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }
  ),
  graphql(gql(groupQueries.usersGroups), {
    name: 'groupsQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  })
)(UserFormContainer);

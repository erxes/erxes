import React, { PropTypes } from 'react';
import { compose, gql, graphql } from 'react-apollo';
import { UserForm } from '../components';
import { Spinner } from '/imports/react-ui/common';

const UserFormContainer = props => {
  const { object = {}, channelsQuery } = props;

  if (channelsQuery.loading) {
    return <Spinner />;
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
  };

  return <UserForm {...updatedProps} />;
};

UserFormContainer.propTypes = {
  object: PropTypes.object,
  channelsQuery: PropTypes.object,
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
        fetchPolicy: 'network-only',
      }),
    },
  ),
)(UserFormContainer);

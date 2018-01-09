import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Spinner } from 'modules/common/components';
import { ChannelForm } from '../components';

const ChannelFormContainer = props => {
  const { channel, save, usersQuery } = props;

  if (usersQuery.loading) {
    return <Spinner objective />;
  }

  const members = usersQuery.users || [];
  let selectedMembers = [];

  if (channel) {
    selectedMembers = members.filter(u => channel.memberIds.includes(u._id));
  }

  const updatedProps = {
    ...props,
    channel,
    members,
    save,
    selectedMembers
  };

  return <ChannelForm {...updatedProps} />;
};

ChannelFormContainer.propTypes = {
  channel: PropTypes.object,
  save: PropTypes.func,
  usersQuery: PropTypes.object
};

export default compose(
  graphql(
    gql`
      query users {
        users {
          _id
          details {
            avatar
            fullName
            position
            twitterUsername
          }
        }
      }
    `,
    {
      name: 'usersQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }
  )
)(ChannelFormContainer);

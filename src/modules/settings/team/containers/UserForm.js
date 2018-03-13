import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { UserForm } from '../components';
import { Spinner } from 'modules/common/components';
import { queries } from '../graphql';

const UserFormContainer = props => {
  const { object = {}, channelsQuery } = props;

  if (channelsQuery.loading) {
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
    channels
  };

  return <UserForm {...updatedProps} />;
};

UserFormContainer.propTypes = {
  object: PropTypes.object,
  channelsQuery: PropTypes.object
};

export default compose(
  graphql(gql(queries.channels), {
    name: 'channelsQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  })
)(UserFormContainer);

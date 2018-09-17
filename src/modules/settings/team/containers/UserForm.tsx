import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { IUser } from '../../../auth/types';
import { UserForm } from '../components';
import { queries } from '../graphql';

type Props = {
  object: IUser,
  channelsQuery: any,
  closeModal: () => void
};

const UserFormContainer = (props: Props) => {
  const { channelsQuery } = props;

  const object = props.object || {} as IUser;

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

export default compose(
  graphql(gql(queries.channels), {
    name: 'channelsQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  })
)(UserFormContainer);

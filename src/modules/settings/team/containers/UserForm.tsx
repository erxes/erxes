import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { ICommonFormProps } from 'modules/settings/common/types';
import {
  IUserGroup,
  UsersGroupsQueryResponse
} from 'modules/settings/permissions/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { IUser } from '../../../auth/types';
import { withProps } from '../../../common/utils';
import { ChannelsQueryResponse, IChannel } from '../../channels/types';
import { queries as usersGroupsQueries } from '../../permissions/graphql';
import { UserForm } from '../components';
import { queries } from '../graphql';

type Props = {
  channelsQuery: ChannelsQueryResponse;
  groupsQuery: UsersGroupsQueryResponse;
};

const UserFormContainer = (props: Props & ICommonFormProps) => {
  const { channelsQuery, groupsQuery } = props;

  const object = props.object || ({} as IUser);

  if (channelsQuery.loading || groupsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const channels = channelsQuery.channels;
  const groups = groupsQuery.usersGroups;

  let selectedChannels: IChannel[] = [];
  let selectedGroups: IUserGroup[] = [];

  if (object._id) {
    selectedChannels = channels.filter(c => c.memberIds.includes(object._id));
    selectedGroups = groups.filter(g => object.groupIds.includes(g));
  }

  const updatedProps = {
    ...props,
    selectedChannels,
    selectedGroups,
    channels,
    groups
  };

  return <UserForm {...updatedProps} />;
};

export default withProps<ICommonFormProps>(
  compose(
    graphql<{}, ChannelsQueryResponse>(gql(queries.channels), {
      name: 'channelsQuery',
      options: () => ({ fetchPolicy: 'network-only' })
    }),
    graphql<{}, UsersGroupsQueryResponse>(gql(usersGroupsQueries.usersGroups), {
      name: 'groupsQuery',
      options: () => ({ fetchPolicy: 'network-only' })
    })
  )(UserFormContainer)
);

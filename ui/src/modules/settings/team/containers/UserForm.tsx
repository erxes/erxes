import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import { IButtonMutateProps } from 'modules/common/types';
import { ICommonFormProps } from 'modules/settings/common/types';
import { queries as generalQueries } from 'modules/settings/general/graphql';
import {
  IUserGroup,
  UsersGroupsQueryResponse
} from 'modules/settings/permissions/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { IUser } from '../../../auth/types';
import { withProps } from '../../../common/utils';
import { queries as channelQueries } from '../../channels/graphql';
import { ChannelsQueryResponse, IChannel } from '../../channels/types';
import { queries as usersGroupsQueries } from '../../permissions/graphql';
import UserForm from '../components/UserForm';

type Props = {
  channelsQuery: ChannelsQueryResponse;
  groupsQuery: UsersGroupsQueryResponse;
  getEnvQuery: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

const UserFormContainer = (props: Props & ICommonFormProps) => {
  const { channelsQuery, getEnvQuery, groupsQuery, renderButton } = props;

  const config = getEnvQuery.configsGetEnv || {};
  const object = props.object || ({} as IUser);

  if (channelsQuery.loading || groupsQuery.loading) {
    return <Spinner />;
  }

  const channels = channelsQuery.channels || [];
  const groups = groupsQuery.usersGroups || [];

  let selectedChannels: IChannel[] = [];
  let selectedGroups: IUserGroup[] = [];

  if (object._id) {
    selectedChannels = channels.filter(c =>
      (c.memberIds || []).includes(object._id)
    );
    selectedGroups = groups.filter(g =>
      (object.groupIds || []).includes(g._id)
    );
  }

  const updatedProps = {
    ...props,
    showBrands: config.USE_BRAND_RESTRICTIONS === 'true',
    selectedChannels,
    selectedGroups,
    channels,
    groups,
    renderButton
  };

  return <UserForm {...updatedProps} />;
};

export default withProps<ICommonFormProps>(
  compose(
    graphql(gql(generalQueries.configsGetEnv), {
      name: 'getEnvQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),
    graphql<{}, ChannelsQueryResponse>(gql(channelQueries.channels), {
      name: 'channelsQuery',
      options: () => ({ fetchPolicy: 'network-only' })
    }),
    graphql<{}, UsersGroupsQueryResponse>(gql(usersGroupsQueries.usersGroups), {
      name: 'groupsQuery',
      options: () => ({ fetchPolicy: 'network-only' })
    })
  )(UserFormContainer)
);

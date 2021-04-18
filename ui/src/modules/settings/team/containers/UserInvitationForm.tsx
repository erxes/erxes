import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IButtonMutateProps } from 'modules/common/types';
import { ICommonFormProps } from 'modules/settings/common/types';
import { IUserGroup } from 'modules/settings/permissions/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { queries as channelQueries } from '../../channels/graphql';
import { ChannelsQueryResponse } from '../../channels/types';
import UserInvitationForm from '../components/UserInvitationForm';

type WrapperProps = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  usersGroups: IUserGroup[];
  refetchQueries: any;
} & ICommonFormProps;

type Props = {
  channelsQuery: ChannelsQueryResponse;
} & WrapperProps;

const UserInviteFormContainer = (props: Props & ICommonFormProps) => {
  const { channelsQuery } = props;

  const channels = channelsQuery.channels || [];

  const updatedProps = Object.assign({}, props, {
    channels,
    channelsQuery: null
  });

  return <UserInvitationForm {...updatedProps} />;
};

export default withProps<WrapperProps>(
  compose(
    graphql<{}, ChannelsQueryResponse>(gql(channelQueries.channels), {
      name: 'channelsQuery'
    })
  )(UserInviteFormContainer)
);
